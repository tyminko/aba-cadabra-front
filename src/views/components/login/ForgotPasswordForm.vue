<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div class="login-container forgot bg-white px-sm">
    <button class="flex items-center">
      <i class="material-icons text-xl text-gray-600 hover:text-aba-blue" @click="$emit('close')">close</i>
    </button>
    <div class="px-sm mb-sm">Reset Password</div>
    <form
      ref="formRef"
      class="login-box"
      @submit.prevent="handleSendRequest">
        <px-input
          ref="emailRef"
          v-model="userEmail"
          label="Email"
          type="email"
          hint="Request an email with the password resetting details."
          :error="error"
          :validate-on-blur="true"
          :rules="[validationRules.required, validationRules.email, validationRules.serverError]"
          @input="clearMessage" />
        <div v-if="message" class="desc px-sm" :class="{open: message}">
          {{message}}
        </div>
    </form>
    <div class="flex justify-end">
      <button
        :disabled="!enableRequest"
        @click="handleSendRequest"
        class="submit w-auto p-sm">
        Send Email
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth } from '../../../lib/firebase'
import PxInput from '../UI/inputs/PxInput'

// Emit
defineEmit(['close'])

// Ref
const formRef = ref(null)
const emailRef = ref(null)
const userEmail = ref('')
const savedEmail = ref('')
const emailIsSent = ref(false)
const error = ref(null)

// Error Message
const errorMessages = {
  'auth/user-not-found': 'There is no user with this email address.',
  'auth/invalid-email': "It doesn't look like an email address.",
  default: 'Sorry, there was a problem with sending a message to this email address.'
}

// Validation Rule
const validationRules = {
  required: value => (!!value || emailIsSent.value) || 'Required',
  email: value => /.+@.+\..+/.test(value) || 'E-mail must be valid',
  serverError: value => !error.value || (errorMessages[error.value.code] || errorMessages.default)
}

// Computed
const message = computed(() => {
  if (emailIsSent.value) {
    return `An Email with the password resetting details has been sent to ${savedEmail.value}.`
  }
  return ''
})

const formValid = computed(() =>
  userEmail.value && (emailRef.value || {}).isValid
)

const enableRequest = computed(() => formValid.value)

// Method
const handleSendRequest = async () => {
  try {
    await auth.sendPasswordResetEmail(userEmail.value)
    emailIsSent.value = true
    savedEmail.value = userEmail.value
    userEmail.value = ''
    error.value = null
  } catch (err) {
    error.value = errorMessages[err.code] || errorMessages.default
  }
}

const clearMessage = () => {
  error.value = null
  emailIsSent.value = false
  savedEmail.value = ''
}

// Lifecycle
onMounted(() => {
  emailRef.value?.focu ()
})
</script>

<style lang="scss">
</style>
