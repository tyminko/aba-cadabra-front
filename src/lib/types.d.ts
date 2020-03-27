/* eslint-disable no-undef */
// Type definitions for post
import { PostAttachment, SourceSet } from './storage'

type PostStatus = 'public' | 'private' | 'draft'

declare interface Link {
  url: string,
  title?: string
}

declare interface Location {
  address: string,
  city: string,
  country: string,
  countryCode: string,
  lat: number,
  lng: number
}

declare interface Institution {
  title: string,
  country: string,
  url: string,
  logo: PostAttachment,
  text?: string,
  order: number,
}

declare interface InstitutionRef {
  id: string,
  title: string,
  logo: SourceSet,
}

declare interface Profile {
  displayName: string,
  email: string,
  registered: number,
  photoURL?: string,
  photo?: SourceSet,
  searchIndices?: string[],
  links: Link[],
  text?: string,
  attachments?: PostAttachment[],
  participatedIn?: ProgrammePostRef[]
}

declare interface ResidentProfile extends Profile {
  residencyStart?: number,
  residencyEnd?: number,
  country?: string[],
  supportedBy?: InstitutionRef[]
}

declare interface StaffProfile extends Profile {
  abaPosition?: string,
  order?: number
}

declare interface ProfileRef {
  id: string,
  displayName: string,
  photoURL?: string,
  photo?: SourceSet
}

declare interface Tag {
  id: string,
  title: string
}

declare interface Post {
  author?: ProfileRef,
  title: string,
  content?: string,
  excerpt?: string,
  created?: number,
  modified?: number,
  status: PostStatus,
  thumbnail?: string, // Id of an attachment
  attachments?: {[k: string]: PostAttachment},
  date?: number,
  cardSize: string,
  tagIds: string[],
  tags: Tag[],
}

declare interface EventPost extends Post{
  date?: number,
  endDate?: number,
  location: Location,
  participants?: ProfileRef[],
  supportedBy?: InstitutionRef[]
}

declare interface ProgrammePost extends EventPost {
  countNumber?: number | string,
  partOfProgramme: ProgrammeRef
}

declare interface ProgrammePostRef {
  postId: string,
  title?: string,
  date?: number,
  endDate?: number,
  participants?: ProfileRef[],
  excerpt?: string,
  thumbnail?: SourceSet,
  countNumber?: number | string,
}

declare interface Programme extends Post {
  singlePostLabel: string,
  date?: number,
  endDate?: number,
  events: ProgrammePostRef[],
  supportedBy?: InstitutionRef[],
  order?: number,
}

declare interface ProgrammeRef {
  programmeId: string,
  singlePostLabel: string,
  title?: string,
}
