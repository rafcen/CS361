export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const username = query.username as string
    
    if (!username) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Username is required'
        })
    }
    
    const db = useDatabase() // Use default database
    
    try {
        // Get user ID from users table
        const userResult = await db.sql`SELECT id FROM users WHERE username = ${username}`;
        
        if (userResult.rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: `User ${username} not found`
            })
        }
        
        const userId = userResult.rows[0].id;
        
        // Get transactions from transactions table
        const transactions = await db.sql`
            SELECT id, date, description, amount
            FROM transactions 
            WHERE user_id = ${userId} 
            ORDER BY id DESC 
        `;
        
        return { 
            transactions: transactions.rows,
            username: username,
            count: transactions.rows.length
        };
        
    } catch (error: any) {
        console.error('Get transactions error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch transactions'
        })
    }
});