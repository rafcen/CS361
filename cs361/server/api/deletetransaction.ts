export default defineEventHandler(async (event) => {
    const requestbody = await readBody(event)
    
    if (!requestbody.transactionId || !requestbody.username) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Transaction ID and username are required'
        })
    }
    
    const db = useDatabase()
    
    try {
        // First, verify the user exists and get their ID
        const userResult = await db.sql`SELECT id FROM users WHERE username = ${requestbody.username}`;
        
        if (userResult.rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: `User ${requestbody.username} not found`
            })
        }
        
        const userId = userResult.rows[0].id;
        
        // Check if the transaction exists and belongs to this user
        const transactionCheck = await db.sql`
            SELECT id FROM transactions 
            WHERE id = ${requestbody.transactionId} AND user_id = ${userId}
        `;
        
        if (transactionCheck.rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Transaction not found or you do not have permission to delete it'
            })
        }
        
        // Delete the transaction
        await db.sql`DELETE FROM transactions WHERE id = ${requestbody.transactionId} AND user_id = ${userId}`;
        
        return { 
            message: `Transaction ${requestbody.transactionId} deleted successfully.`,
            success: true
        };
        
    } catch (error: any) {
        console.error('Delete transaction error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete transaction'
        })
    }
});