<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div class="login-container reset-password">
    <form
      v-if="tokenIsOk"
      @submit.prevent="handleSubmit"
      :aria-labelledby="titleId"
      :aria-describedby="messageId"
      novalidate>

      <h1 :id="titleId" class="sr-only">{{ $t('login.header.Reset you Password') }}</h1>
      <p :id="messageId" class="message" role="status">
        {{ $t('login.header.Reset you Password') }}
      </p>

      <div class="form-group">
        <float-label>
          <input
            v-model="form.password"
            :id="passwordId"
            :aria-describedby="passwordErrorId"
            :aria-invalid="!!passwordError"
            :disabled="isSubmitting"
            :placeholder="$t('login.label.Password')"
            autocomplete="new-password"
            type="password"
            @blur="validatePassword">
        </float-label>
        <p
          v-if="passwordError"
          :id="passwordErrorId"
          class="error-message"
          role="alert">
          {{ passwordError }}
        </p>
      </div>

      <div class="form-group">
        <float-label>
          <input
            v-model="form.passwordConfirm"
            :id="confirmPasswordId"
            :aria-describedby="confirmPasswordErrorId"
            :aria-invalid="!!confirmPasswordError"
            :disabled="isSubmitting"
            :placeholder="$t('login.label.Repeat Password')"
            autocomplete="new-password"
            type="password"
            @blur="validatePasswordConfirm">
        </float-label>
        <p
          v-if="confirmPasswordError"
          :id="confirmPasswordErrorId"
          class="error-message"
          role="alert">
          {{ confirmPasswordError }}
        </p>
      </div>

      <div class="form-footer">
        <button
          type="submit"
          :disabled="!isValid || isSubmitting"
          :aria-busy="isSubmitting">
          <span v-if="isSubmitting">{{ $t('common.loading') }}</span>
          <span v-else>{{ $t('login.button.Reset Password') }}</span>
        </button>

        <p
          v-if="submitError"
          :id="submitErrorId"
          class="error-message"
          role="alert">
          {{ submitError }}
        </p>
      </div>
    </form>

    <div
      v-else
      :aria-labelledby="invalidTokenId">
      <p :id="invalidTokenId" class="message" role="status">
        {{ $t('login.message.InvalidToken') }}
      </p>
      <button
        class="mini"
        @click="redirect"
        type="button">
        {{ $t('login.button.Request another link') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useId } from '../../../composables/useId'
import FloatLabel from '../../../components/UI/FloatLabel.vue'

// i18n
const { t } = useI18n ()

// Router
const route = useRoute ()
const router = useRouter ()

// Form state
const form = ref({
  password: '',
  passwordConfirm: ''
})

// UI state
const isSubmitting = ref(false)
const tokenIsOk = ref(false)
const submitError = ref('')

// Validation state
const passwordError = ref('')
const confirmPasswordError = ref('')

// Generate unique ID
const baseId = useId('reset-password')
const titleId = useId({ prefix: 'title', namespace: baseId })
const messageId = useId({ prefix: 'message', namespace: baseId })
const passwordId = useId({ prefix: 'password', namespace: baseId })
const passwordErrorId = useId({ prefix: 'password-error', namespace: baseId })
const confirmPasswordId = useId({ prefix: 'confirm-password', namespace: baseId })
const confirmPasswordErrorId = useId({ prefix: 'confirm-password-error', namespace: baseId })
const submitErrorId = useId({ prefix: 'submit-error', namespace: baseId })
const invalidTokenId = useId({ prefix: 'invalid-token', namespace: baseId })

// Password validation rule
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

// Computed
const isValid = computed(() => {
  return !passwordError.value &&
         !confirmPasswordError.value &&
         form.value.password &&
         form.value.passwordConfirm
})

// Method
const validatePassword = () => {
  const password = form.value.password

  if (!password) {
    passwordError.value = t('validation.password.required')
    return false
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    passwordError.value = t('validation.password.minLength', { length: PASSWORD_MIN_LENGTH })
    return false
  }

  if (!PASSWORD_PATTERN.test(password)) {
    passwordError.value = t('validation.password.pattern')
    return false
  }

  passwordError.value = ''
  return true
}

const validatePasswordConfirm = () => {
  const { password, passwordConfirm } = form.value

  if (!passwordConfirm) {
    confirmPasswordError.value = t('validation.password.confirmRequired')
    return false
  }

  if (password !== passwordConfirm) {
    confirmPasswordError.value = t('validation.password.mismatch')
    return false
  }

  confirmPasswordError.value = ''
  return true
}

const validateToken = async () => {
  const token = route.params.token as string

  if (!token) {
    tokenIsOk.value = false
    return
  }

  try {
    // TODO: Replace with actual API call
    const response = await fetch(`/api/validate-reset-token/${token}`)
    tokenIsOk.value = response.ok
  } catch (error) {
    console.error('Token validation failed:', error)
    tokenIsOk.value = false
  }
}

const handleSubmit = async () => {
  if (!validatePassword () || !validatePasswordConfirm ()) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    // TODO: Replace with actual API call
    const response = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: route.params.token,
        password: form.value.password
      })
    })

    if (!response.ok) {
      throw new Error('Password reset failed')
    }

    // Redirect to login with success message
    router.push({
      name: 'login',
      query: { message: 'password-reset-success' }
    })
  } catch (error) {
    submitError.value = error instanceof Error
      ? error.message
      : 'An error occurred while resetting your password'
  } finally {
    isSubmitting.value = false
  }
}

const redirect = () => {
  router.replace({ name: 'forgot-password' })
}

// Lifecycle
onMounted(validateToken)
watch(() => route.params.token, validateToken)

// Validation on input
watch(() => form.value.password, () => {
  if (passwordError.value) validatePassword ()
  if (confirmPasswordError.value) validatePasswordConfirm ()
})

watch(() => form.value.passwordConfirm, () => {
  if (confirmPasswordError.value) validatePasswordConfirm ()
})
</script>

<style lang="scss" scoped>
.reset-password {
  .form-group {
    margin-bottom: 1rem;
  }

  .error-message {
    color: var(--error-color, #dc2626);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .form-footer {
    margin-top: 1.5rem;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--primary-color, #4f46e5);
    color: white;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: background-color 0.2s;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background-color: var(--primary-color-dark, #4338ca);
    }

    &.mini {
      width: auto;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  }

  .message {
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--text-color, #374151);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
