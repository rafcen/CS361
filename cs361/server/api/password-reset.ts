import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' }
    }
    // Add more validation rules as needed
    return { valid: true }
}



export default defineEventHandler(async (event) => {
    const requestbody = await readBody(event)
    
    // Validate required fields
    if (!requestbody.email || !requestbody.username) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email and username are required'
        })
    }
    
    const db = useDatabase()
    
    try {
        // Check if user exists with matching email AND username
        const userResult = await db.sql`
            SELECT id, email, username 
            FROM users 
            WHERE email = ${requestbody.email} AND username = ${requestbody.username}
        `
        
        if (userResult.rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'No account found with that email and username combination'
            })
        }
        
        const user = userResult.rows[0]
        
        // Generate new temporary password
        const newPassword = await generateRandomPassword()
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        
        // Update password in database
        await db.sql`
            UPDATE users 
            SET password = ${hashedPassword} 
            WHERE id = ${user.id}
        `
        
        // In a real app, you'd send this via email
        // For now, we'll return it in the response (NOT SECURE - just for testing)
        return {
            message: `Password reset successful! Your new temporary password is: ${newPassword}. Please log in and change it immediately.`,
            success: true,
            // Remove this in production - send via email instead
            temporaryPassword: newPassword
        }
        
    } catch (error: any) {
        console.error('Password reset error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to reset password. Please try again.'
        })
    }
})