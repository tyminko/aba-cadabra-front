declare module '*.json' {
  const value: {
    users: Array<{
      ID: number
      user_login: string
      user_email: string
      user_pass: string
      user_nicename: string
      user_url: string
      user_registered: string
      user_status: number
      display_name: string
    }>
    attachment: Array<{
      post: {
        ID: number
        url: string
        post_mime_type: string
        post_parent: number
      }
      meta: {
        _wp_attachment_metadata?: {
          sizes?: {
            thumbnail?: {
              file?: string
            }
          }
        }
      }
    }>
  }
  export default value
} 