'use server'

import { createClient } from '@/lib/supabase/server'
import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = {
  success?: boolean
  error?: string
}

/**
 * Log in a user with email and password
 */
export async function signInAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please enter both email and password.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  redirect('/admin')
}

/**
 * Log out the currently authenticated user
 */
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
  redirect('/login')
}

/**
 * Helper to upload image to Vercel Blob
 */
async function uploadImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    return ''
  }

  try {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const blob = await put(filename, file, {
      access: 'public',
    })
    return blob.url
  } catch (error: any) {
    console.error('Vercel Blob upload error:', error)
    throw new Error(`Failed to upload image: ${error.message || error}`)
  }
}

/**
 * Create a new project
 */
export async function createProjectAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const title = formData.get('title') as string
  const summary = formData.get('summary') as string
  const tagsString = formData.get('tags') as string // comma-separated list of tags
  const featured = formData.get('featured') === 'true'
  const imageFile = formData.get('image') as File
  const architectureImageFile = formData.get('architecture_image') as File
  const overview = formData.get('overview') as string
  const technologies = formData.get('technologies') as string
  const achievements = formData.get('achievements') as string
  const challenges = formData.get('challenges') as string
  const github_url = formData.get('github_url') as string

  if (!title || !summary) {
    return { error: 'Title and Summary are required fields.' }
  }

  try {
    let imageUrl = ''
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile)
    }

    let architectureImageUrl = ''
    if (architectureImageFile && architectureImageFile.size > 0) {
      architectureImageUrl = await uploadImage(architectureImageFile)
    }

    const tags = tagsString
      ? tagsString
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : []

    const supabase = await createClient()

    // Auth validation
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Unauthorized: Admin authentication required.' }
    }

    // Retrieve highest order_index to append
    const { data: orderData } = await supabase
      .from('projects')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = orderData && orderData.length > 0 ? (orderData[0].order_index ?? 0) + 1 : 0

    const { error } = await supabase.from('projects').insert({
      title,
      summary,
      image: imageUrl || null,
      architecture_image: architectureImageUrl || null,
      tags,
      featured,
      overview: overview || null,
      technologies: technologies || null,
      achievements: achievements || null,
      challenges: challenges || null,
      github_url: github_url || null,
      order_index: nextOrderIndex,
    })

    if (error) {
      return { error: `Database error: ${error.message}` }
    }

  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }

  revalidatePath('/')
  revalidatePath('/projects/[id]', 'page')
  redirect('/admin')
}

/**
 * Update an existing project
 */
export async function updateProjectAction(
  id: string,
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const title = formData.get('title') as string
  const summary = formData.get('summary') as string
  const tagsString = formData.get('tags') as string
  const featured = formData.get('featured') === 'true'
  const imageFile = formData.get('image') as File
  const originalImageUrl = formData.get('originalImageUrl') as string
  const architectureImageFile = formData.get('architecture_image') as File
  const originalArchitectureImageUrl = formData.get('originalArchitectureImageUrl') as string
  const overview = formData.get('overview') as string
  const technologies = formData.get('technologies') as string
  const achievements = formData.get('achievements') as string
  const challenges = formData.get('challenges') as string
  const github_url = formData.get('github_url') as string

  if (!title || !summary) {
    return { error: 'Title and Summary are required fields.' }
  }

  try {
    let imageUrl = originalImageUrl
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile)
    }

    let architectureImageUrl = originalArchitectureImageUrl
    if (architectureImageFile && architectureImageFile.size > 0) {
      architectureImageUrl = await uploadImage(architectureImageFile)
    }

    const tags = tagsString
      ? tagsString
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : []

    const supabase = await createClient()

    // Auth validation
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Unauthorized: Admin authentication required.' }
    }

    const { error } = await supabase
      .from('projects')
      .update({
        title,
        summary,
        image: imageUrl || null,
        architecture_image: architectureImageUrl || null,
        tags,
        featured,
        overview: overview || null,
        technologies: technologies || null,
        achievements: achievements || null,
        challenges: challenges || null,
        github_url: github_url || null,
      })
      .eq('id', id)

    if (error) {
      return { error: `Database error: ${error.message}` }
    }

  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }

  revalidatePath('/')
  revalidatePath('/projects/[id]', 'page')
  redirect('/admin')
}

/**
 * Delete a project
 */
export async function deleteProjectAction(id: string): Promise<ActionState> {
  try {
    const supabase = await createClient()

    // Auth validation
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Unauthorized: Admin authentication required.' }
    }

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      return { error: `Database error: ${error.message}` }
    }

    revalidatePath('/')
    revalidatePath('/projects/[id]', 'page')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

/**
 * Reorder projects in bulk by updating their order_index
 */
export async function reorderProjectsAction(projectIds: string[]): Promise<ActionState> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const promises = projectIds.map((id, index) =>
      supabase
        .from('projects')
        .update({ order_index: index })
        .eq('id', id)
    )

    const results = await Promise.all(promises)
    const firstError = results.find((r) => r.error)

    if (firstError) {
      return { error: `Database error: ${firstError.error!.message}` }
    }

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to reorder projects.' }
  }
}

/**
 * Submit a contact message from the home page form
 */
export async function submitContactFormAction(
  name: string,
  email: string,
  message: string
): Promise<ActionState> {
  if (!name || !email || !message) {
    return { error: 'All fields are required.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      message,
    })

    if (error) {
      return { error: `Failed to save message: ${error.message}` }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

/**
 * Delete a contact message
 */
export async function deleteContactMessageAction(id: string): Promise<ActionState> {
  try {
    const supabase = await createClient()

    // Auth validation
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Unauthorized: Admin authentication required.' }
    }

    const { error } = await supabase.from('contact_messages').delete().eq('id', id)

    if (error) {
      return { error: `Database error: ${error.message}` }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}




