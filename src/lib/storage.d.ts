// Type definitions for storage
type KnownAttachmentSizes = 'original'|'full'|'preview'

declare interface Dimensions {
  w: number,
  h: number
}

declare interface FileData {
  url: string,
  name?: string,
  size?: number,
  lastModified?: number,
  blob?: Blob
}

declare interface ImageData extends FileData{
  dimensions: Dimensions,
}

declare interface PostAttachment {
  id: string,
  name: string,
  type: string,
  order: number,
  srcSet: { [key in KnownAttachmentSizes]: FileData|ImageData },
  caption?: string,
  pointOfInterest?: { x:number, y:number },
}

declare interface PostVideoAttachment extends PostAttachment {
  duration: number
}

declare interface RawAttachment extends PostAttachment {
  file: Blob|File,
  image?: HTMLImageElement,
  err?: Error,
  progress: number
}

declare interface DataToUpload {
  sizeType: KnownAttachmentSizes,
  blob: Blob,
  name?: string,
  dimensions?: Dimensions,
  rawAttachment: RawAttachment
}

declare interface UploadedData extends DataToUpload {
  url: string
}

declare interface VimeoEmbedData {
  account_type: string,
  author_name: string,
  author_url: string,
  description: string,
  duration: number,
  height: number,
  html: string,
  is_plus: string,
  thumbnail_height: number,
  thumbnail_url: string,
  thumbnail_url_with_play_button: string,
  thumbnail_width: number,
  video_id: number,
  width: number,
}

declare function upload(
  userId:string,
  attachments: RawAttachment[],
  progressFn: (id:string, progress:number) => void
):Promise<{[key:string]: PostAttachment[]} | never>

declare function deleteAttachments (userId: string, attachmentsToDelete: PostAttachment[]) :Promise<void|never>

export function isSupportedFormat(file:File): boolean
export function isSupportedImage(file:File): boolean
export function fileToRawAttachment(file:File): RawAttachment;

// declare function uploadStruct(
//   blob:Blob,
//   name:string,
//   sizeType:KnownAttachmentSizes,
//   dimensions: Dimensions,
//   attachment: RawAttachment
// ): DataToUpload;

