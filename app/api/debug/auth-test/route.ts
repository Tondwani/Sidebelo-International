// import { NextResponse } from 'next/server'
// import { pocketbaseConfig } from '@/lib/pocketbase'

// export async function POST(request: Request) {
//   try {
//     const { email, password } = await request.json()
    
//     if (!pocketbaseConfig.isConfigured) {
//       return NextResponse.json({ error: 'PocketBase is not configured' }, { status: 500 })
//     }

//     const baseUrl = pocketbaseConfig.baseUrl
//     const normalizedEmail = email.trim().toLowerCase()
    
//     const results = {
//       pocketbaseUrl: baseUrl,
//       email: normalizedEmail,
//       tests: [] as any[]
//     }

//     // Test 1: Try regular user authentication
//     try {
//       const userResponse = await fetch(`${baseUrl}/api/collections/users/auth-with-password`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ identity: normalizedEmail, password }),
//         cache: 'no-store',
//       })
      
//       const userData = await userResponse.json()
//       results.tests.push({
//         name: 'Regular User Auth',
//         success: userResponse.ok,
//         status: userResponse.status,
//         data: userResponse.ok ? { 
//           token: userData.token?.substring(0, 20) + '...', 
//           user: { 
//             id: userData.record?.id, 
//             email: userData.record?.email, 
//             role: userData.record?.role 
//           } 
//         } : userData
//       })
//     } catch (error) {
//       results.tests.push({
//         name: 'Regular User Auth',
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error'
//       })
//     }

//     // Test 2: Try superuser authentication
//     try {
//       const superuserResponse = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ identity: normalizedEmail, password }),
//         cache: 'no-store',
//       })
      
//       const superuserData = await superuserResponse.json()
//       results.tests.push({
//         name: 'Superuser Auth',
//         success: superuserResponse.ok,
//         status: superuserResponse.status,
//         data: superuserResponse.ok ? { 
//           token: superuserData.token?.substring(0, 20) + '...', 
//           user: { 
//             id: superuserData.record?.id, 
//             email: superuserData.record?.email, 
//             role: superuserData.record?.role 
//           } 
//         } : superuserData
//       })
//     } catch (error) {
//       results.tests.push({
//         name: 'Superuser Auth',
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error'
//       })
//     }

//     // Test 3: Check if users collection exists and is accessible
//     try {
//       const usersListResponse = await fetch(`${baseUrl}/api/collections/users/records`, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//         cache: 'no-store',
//       })
      
//       results.tests.push({
//         name: 'Users Collection Access',
//         success: usersListResponse.ok,
//         status: usersListResponse.status,
//         data: usersListResponse.ok ? 'Accessible' : 'Not accessible'
//       })
//     } catch (error) {
//       results.tests.push({
//         name: 'Users Collection Access',
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error'
//       })
//     }

//     // Test 4: Check if _superusers collection exists and is accessible
//     try {
//       const superusersListResponse = await fetch(`${baseUrl}/api/collections/_superusers/records`, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//         cache: 'no-store',
//       })
      
//       results.tests.push({
//         name: 'Superusers Collection Access',
//         success: superusersListResponse.ok,
//         status: superusersListResponse.status,
//         data: superusersListResponse.ok ? 'Accessible' : 'Not accessible'
//       })
//     } catch (error) {
//       results.tests.push({
//         name: 'Superusers Collection Access',
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error'
//       })
//     }

//     return NextResponse.json(results)
//   } catch (error) {
//     return NextResponse.json({ 
//       error: error instanceof Error ? error.message : 'Debug test failed' 
//     }, { status: 500 })
//   }
// }