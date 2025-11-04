import { hashPassword } from '../utils/password'

export default defineEventHandler(async (event) => {  // ← Must be export default
    const requestbody = await readBody(event)
    
    if (!requestbody.email || !requestbody.username || !requestbody.newPassword) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email, username, and new password are required'
        })
    }
    
    const db = useDatabase()
    
    try {
        // Verify the account exists
        const userResult = await db.sql`
            SELECT id, username, email 
            FROM users 
            WHERE email = ${requestbody.email} AND username = ${requestbody.username}
        `
        
        if (userResult.rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Account not found. Please verify your credentials first.'
            })
        }
        
        const user = userResult.rows[0]
        
        // Hash the password
        const hashedPassword = await hashPassword(requestbody.newPassword)
        
        // Update password in database
        await db.sql`
            UPDATE users 
            SET password = ${hashedPassword} 
            WHERE id = ${user.id}
        `
        
        return {
            message: `Password reset successful for ${user.username}! You can now log in with your new password.`,
            success: true
        }
        
    } catch (error: any) {
        console.error('Password reset error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to reset password'
        })
    }
})