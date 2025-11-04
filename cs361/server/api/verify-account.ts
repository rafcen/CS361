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
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' }
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' }
    }
    
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' }
    }
    
    return { valid: true }
}

export default defineEventHandler(async (event) => {  // ← Must be export default
    const requestbody = await readBody(event)
    
    if (!requestbody.email || !requestbody.username) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email and username are required'
        })
    }
    
    const db = useDatabase()
    
    try {
        // Check if user exists
        const userResult = await db.sql`
            SELECT id, username, email 
            FROM users 
            WHERE email = ${requestbody.email} AND username = ${requestbody.username}
        `
        
        if (userResult.rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'No account found with that email and username combination'
            })
        }
        
        return {
            message: 'Account verified successfully',
            success: true
        }
        
    } catch (error: any) {
        console.error('Account verification error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Account verification failed'
        })
    }
})