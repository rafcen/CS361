import { hashPassword, validatePasswordStrength } from '../utils/password'

export default defineEventHandler(async (event) => {
    const requestbody = await readBody(event)
    
    // Validate required fields
    if (!requestbody.email || !requestbody.username || !requestbody.password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email, username, and password are required'
        })
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(requestbody.password)
    if (!passwordValidation.valid) {
        throw createError({
            statusCode: 400,
            statusMessage: passwordValidation.message
        })
    }
    
    const db = useDatabase()

    try {
        await db.sql`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            username TEXT UNIQUE,
            password TEXT
        )`;
        
        // Hash the password here (server-side)
        const hashedPassword = await hashPassword(requestbody.password)
        
        await db.sql`INSERT INTO users (email, username, password) VALUES (${requestbody.email}, ${requestbody.username}, ${hashedPassword})`;
        
        return { 
            message: `User ${requestbody.username} created successfully.`,
            success: true
        };
        
    } catch (error: any) {
        console.error('Add user error:', error)
        
        if (error.message?.includes('UNIQUE constraint failed: users.username')) {
            throw createError({
                statusCode: 400,
                statusMessage: `Username "${requestbody.username}" is already taken.`
            })
        }
        
        if (error.message?.includes('UNIQUE constraint failed: users.email')) {
            throw createError({
                statusCode: 400,
                statusMessage: `Email "${requestbody.email}" is already registered.`
            })
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create user'
        })
    }
})