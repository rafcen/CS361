export default defineEventHandler(async (event) => {
    const requestbody = await readBody(event)
    
    // Validate required fields
    if (!requestbody.username || !requestbody.amount || !requestbody.date || !requestbody.description) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields'
        })
    }
    
    const db = useDatabase() // Use default database for both tables
    
    // Validate and convert date to US format
    function validateAndFormatUSDate(dateString: string): string {
        // If it's already in MM/DD/YYYY format
        const usDateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
        if (usDateRegex.test(dateString)) {
            return dateString
        }
        
        // If it's in YYYY-MM-DD format (from date input), convert it
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (isoDateRegex.test(dateString)) {
            const date = new Date(dateString + 'T00:00:00.000Z')
            const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
            const day = date.getUTCDate().toString().padStart(2, '0')
            const year = date.getUTCFullYear()
            return `${month}/${day}/${year}`
        }
        
        throw new Error('Invalid date format. Please use MM/DD/YYYY')
    }
    
    try {
        const formattedDate = validateAndFormatUSDate(requestbody.date)
        
        // Query the users table to get user ID
        const userResult = await db.sql`SELECT id FROM users WHERE username = ${requestbody.username}`;
        
        if (userResult.rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: `User ${requestbody.username} not found`
            })
        }
        
        const userId = userResult.rows[0].id;
        
        // Validate amount is a number
        const amount = parseFloat(requestbody.amount)
        if (isNaN(amount)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid amount. Must be a number.'
            })
        }
        
        // Create transactions table in the same database
        await db.sql`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT,
            description TEXT,
            amount REAL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`;
        
        await db.sql`INSERT INTO transactions (user_id, date, description, amount) VALUES (${userId}, ${formattedDate}, ${requestbody.description.trim()}, ${amount})`;
        
        return { 
            message: `Transaction for user ${requestbody.username} added successfully.`,
            success: true
        };
        
    } catch (error: any) {
        console.error('Transaction error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 400,
            statusMessage: error.message || 'Failed to add transaction'
        })
    }
});