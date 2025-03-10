<template>
  <div class="login-container forgot-password">
    <form
      @submit.prevent="handleSubmit"
      :aria-labelledby="titleId"
      novalidate>

      <h1 :id="titleId" class="sr-only">{{ t('login.header.Forgot Password') }}</h1>

      <p
        :id="messageId"
        class="message"
        :class="{ success: emailIsSent, error: !!error }"
        role="status"
        aria-live="polite">
        {{ message }}
      </p>

      <div v-show="!emailIsSent" class="form-content">
        <div class="form-group">
          <float-label>
            <input
              v-model="email"
              :id="emailId"
              :aria-describedby="emailErrorId"
              :aria-invalid="!!emailError"
              :disabled="isSubmitting"
              :placeholder="t('login.label.Email')"
              type="email"
              autocomplete="email"
              @focus="resetForm"
              @blur="validateEmail">
          </float-label>
          <p
            v-if="emailError"
            :id="emailErrorId"
            class="error-message"
            role="alert">
            {{ emailError }}
          </p>
        </div>

        <div class="form-footer">
          <button
            type="submit"
            :disabled="!isValid || isSubmitting"
            :aria-busy="isSubmitting">
            <span v-if="isSubmitting">{{ t('common.loading') }}</span>
            <span v-else>{{ t('login.button.Send Reset Link') }}</span>
          </button>

          <p
            v-if="submitError"
            :id="submitErrorId"
            class="error-message"
            role="alert">
            {{ submitError }}
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useId } from '../../../composables/useId'
import { auth } from '../../../lib/firebase'
import FloatLabel from '../../../components/UI/FloatLabel.vue'

// i18n
const { t } = useI18n ()

// Form state
const email = ref('')
const savedEmail = ref('')
const emailError = ref('')
const submitError = ref('')

// UI state
const isSubmitting = ref(false)
const emailIsSent = ref(false)

// Generate unique ID
const baseId = useId('forgot-password')
const titleId = useId({ prefix: 'title', namespace: baseId })
const messageId = useId({ prefix: 'message', namespace: baseId })
const emailId = useId({ prefix: 'email', namespace: baseId })
const emailErrorId = useId({ prefix: 'email-error', namespace: baseId })
const submitErrorId = useId({ prefix: 'submit-error', namespace: baseId })

// Email validation regex
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Computed
const isValid = computed(() => {
  return !emailError.value && email.value && EMAIL_PATTERN.test(email.value)
})

const message = computed(() => {
  if (emailIsSent.value) {
    return t('login.message.EmailSent', { emailAddress: savedEmail.value })
  }

  if (submitError.value) {
    return submitError.value
  }

  return t('login.message.RequestEmail')
})

// Method
const validateEmail = () => {
  const value = email.value.trim ()

  if (!value) {
    emailError.value = t('validation.email.required')
    return false
  }

  if (!EMAIL_PATTERN.test(value)) {
    emailError.value = t('validation.email.invalid')
    return false
  }

  emailError.value = ''
  return true
}

const resetForm = () => {
  submitError.value = ''
  emailIsSent.value = false
  savedEmail.value = ''
  emailError.value = ''
}

const handleSubmit = async () => {
  if (!validateEmail () || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    await auth.sendPasswordResetEmail(email.value)
    emailIsSent.value = true
    savedEmail.value = email.value
    email.value = ''
  } catch (error) {
    console.error('Failed to send reset email:', error)

    if (error instanceof Error) {
      const errorCode = (error as any).code
      submitError.value = errorCode && t(`login.message.Error.${errorCode}`)
        ? t(`login.message.Error.${errorCode}`)
        : t('login.message.Error.Default')
    } else {
      submitError.value = t('login.message.Error.Default')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.forgot-password {
  .form-group {
    margin-bottom: 1rem;
  }

  .message {
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-radius: 0.375rem;

    &.success {
      background-color: var(--success-bg, #ecfdf5);
      color: var(--success-text, #065f46);
    }

    &.error {
      background-color: var(--error-bg, #fef2f2);
      color: var(--error-text, #991b1b);
    }
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
