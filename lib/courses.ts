import { supabase } from './supabase'

/**
 * Toggles the certification status of a course.
 * @param courseId The ID of the course to update.
 * @param isCertification The new certification status (true for certification course, false otherwise).
 * @returns Object containing data or error.
 */
export async function toggleCourseCertification(courseId: string, isCertification: boolean) {
    try {
        const { data, error } = await supabase
            .from('courses')
            .update({ is_certification: isCertification })
            .eq('id', courseId)
            .select()

        if (error) {
            console.error('Error updating course certification status:', error)
            return { data: null, error }
        }

        return { data, error: null }
    } catch (err) {
        console.error('Unexpected error toggling certification:', err)
        return { data: null, error: err }
    }
}
