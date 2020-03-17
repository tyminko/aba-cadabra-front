import { castToType, modifiedFields } from './cast'

class Profile {
  constructor () {
    this.id = ''
    this.displayName = ''
    this.registered = 0
    this.photoURL = ''
    this.photo = null
    this.text = ''
    this.attachments = null
    this.participatedIn = null
    this.residencyStart = 0
    this.residencyEnd = 0
    this.country = ''
    this.supportedBy = null
    this.abaPosition = []
    this.order = 0

    this.__original = {}
  }
}

export const profileConverter = {
  /**
   * @param {Profile} profile
   * @return {{}}
   */
  toFirestore: (profile) => {
    return modifiedFields(profile)
  },
  /**
   * @param snapshot
   * @param options
   * @return {Profile}
   */
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)
    /** @type Profile */
    const profile = castToType(data, Profile)
    profile.__original = data
    return profile
  }
}
