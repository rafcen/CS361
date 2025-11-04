export default defineEventHandler(async (event) => {
    const requestbody = await readBody(event)
    
    if (!requestbody.username) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Username is required'
        })
    }
    
    const db = useDatabase()

    try {
        // Check if user exists first
        const userCheck = await db.sql`SELECT id FROM users WHERE username = ${requestbody.username}`;
        
        if (userCheck.rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: `User ${requestbody.username} not found`
            })
        }

        const userId = userCheck.rows[0].id;

        // Delete user's transactions first (if any exist)
        await db.sql`DELETE FROM transactions WHERE user_id = ${userId}`;
        
        // Then delete the user
        await db.sql`DELETE FROM users WHERE username = ${requestbody.username}`;
        
        return { message: `User ${requestbody.username} deleted successfully.` };
        
    } catch (error: any) {
        console.error('Delete user error:', error)
        
        if (error.statusCode) {
            throw error // Re-throw createError errors
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete user'
        })
    }
});