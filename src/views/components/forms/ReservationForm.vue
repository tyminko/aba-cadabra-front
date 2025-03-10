<template>
  <form
    class="reservation-form"
    @submit.prevent="handleSubmit"
    novalidate
    :aria-busy="isSubmitting">
    <div class="reservation-form__header">
      <h2 class="reservation-form__title">Make a Reservation</h2>
      <p class="reservation-form__subtitle">Please fill out the form below to book your appointment</p>
    </div>

    <div class="reservation-form__fields">
      <!-- Date and Time Selection -->
      <div class="reservation-form__row">
        <div class="reservation-form__field">
          <label
            for="date"
            class="reservation-form__label"
            :class="{ 'reservation-form__label--error': errors.date }">
            Date
          </label>
          <input
            id="date"
            v-model="formData.date"
            type="date"
            class="reservation-form__input"
            :class="{ 'reservation-form__input--error': errors.date }"
            :min="minDate"
            :max="maxDate"
            required
            aria-required="true"
            :aria-invalid="!!errors.date"
            :aria-describedby="errors.date ? 'date-error' : undefined">
          <div
            v-if="errors.date"
            id="date-error"
            class="reservation-form__error"
            role="alert">
            {{ errors.date }}
          </div>
        </div>

        <div class="reservation-form__field">
          <label
            for="time"
            class="reservation-form__label"
            :class="{ 'reservation-form__label--error': errors.time }">
            Time
          </label>
          <select
            id="time"
            v-model="formData.time"
            class="reservation-form__input"
            :class="{ 'reservation-form__input--error': errors.time }"
            required
            aria-required="true"
            :aria-invalid="!!errors.time"
            :aria-describedby="errors.time ? 'time-error' : undefined">
            <option value="">Select a time</option>
            <option
              v-for="slot in availableTimeSlots"
              :key="slot.value"
              :value="slot.value">
              {{ slot.label }}
            </option>
          </select>
          <div
            v-if="errors.time"
            id="time-error"
            class="reservation-form__error"
            role="alert">
            {{ errors.time }}
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="reservation-form__row">
        <div class="reservation-form__field">
          <label
            for="name"
            class="reservation-form__label"
            :class="{ 'reservation-form__label--error': errors.name }">
            Full Name
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="reservation-form__input"
            :class="{ 'reservation-form__input--error': errors.name }"
            required
            aria-required="true"
            :aria-invalid="!!errors.name"
            :aria-describedby="errors.name ? 'name-error' : undefined">
          <div
            v-if="errors.name"
            id="name-error"
            class="reservation-form__error"
            role="alert">
            {{ errors.name }}
          </div>
        </div>

        <div class="reservation-form__field">
          <label
            for="email"
            class="reservation-form__label"
            :class="{ 'reservation-form__label--error': errors.email }">
            Email
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="reservation-form__input"
            :class="{ 'reservation-form__input--error': errors.email }"
            required
            aria-required="true"
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'email-error' : undefined">
          <div
            v-if="errors.email"
            id="email-error"
            class="reservation-form__error"
            role="alert">
            {{ errors.email }}
          </div>
        </div>
      </div>

      <div class="reservation-form__row">
        <div class="reservation-form__field">
          <label
            for="phone"
            class="reservation-form__label"
            :class="{ 'reservation-form__label--error': errors.phone }">
            Phone Number
          </label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            class="reservation-form__input"
            :class="{ 'reservation-form__input--error': errors.phone }"
            required
            aria-required="true"
            :aria-invalid="!!errors.phone"
            :aria-describedby="errors.phone ? 'phone-error' : undefined">
          <div
            v-if="errors.phone"
            id="phone-error"
            class="reservation-form__error"
            role="alert">
            {{ errors.phone }}
          </div>
        </div>

        <div class="reservation-form__field">
          <label
            for="guests"
            class="reservation-form__label"
            :class="{ 'reservation-form__label--error': errors.guests }">
            Number of Guest
          </label>
          <select
            id="guests"
            v-model="formData.guests"
            class="reservation-form__input"
            :class="{ 'reservation-form__input--error': errors.guests }"
            required
            aria-required="true"
            :aria-invalid="!!errors.guests"
            :aria-describedby="errors.guests ? 'guests-error' : undefined">
            <option value="">Select number of guests</option>
            <option
              v-for="n in maxGuests"
              :key="n"
              :value="n">
              {{ n }} {{ n === 1 ? 'Guest' : 'Guests' }}
            </option>
          </select>
          <div
            v-if="errors.guests"
            id="guests-error"
            class="reservation-form__error"
            role="alert">
            {{ errors.guests }}
          </div>
        </div>
      </div>

      <!-- Special Requests -->
      <div class="reservation-form__field">
        <label
          for="specialRequests"
          class="reservation-form__label">
          Special Request
        </label>
        <textarea
          id="specialRequests"
          v-model="formData.specialRequests"
          class="reservation-form__textarea"
          rows="4"
          :aria-describedby="'special-requests-help'">
        </textarea>
        <div
          id="special-requests-help"
          class="reservation-form__help-text">
          Any dietary restrictions or special accommodations?
        </div>
      </div>
    </div>

    <div class="reservation-form__actions">
      <button
        type="submit"
        class="reservation-form__submit"
        :disabled="isSubmitting"
        :aria-busy="isSubmitting">
        <span v-if="!isSubmitting">Make Reservation</span>
        <span v-else class="reservation-form__spinner" aria-hidden="true"></span>
      </button>
    </div>

    <div
      v-if="submitError"
      class="reservation-form__error reservation-form__error--global"
      role="alert">
      {{ submitError }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface FormData {
  date: string
  time: string
  name: string
  email: string
  phone: string
  guests: number
  specialRequests: string
}

interface FormErrors {
  date?: string
  time?: string
  name?: string
  email?: string
  phone?: string
  guests?: string
}

interface TimeSlot {
  value: string
  label: string
}

const props = withDefault(defineProps<{
  maxGuests?: number
  minDate?: string
  maxDate?: string
}>(), {
  maxGuests: 10,
  minDate: new Date ().toISOString ().split('T')[0],
  maxDate: new Date(new Date ().setMonth(new Date ().getMonth () + 3)).toISOString ().split('T')[0]
})

const emit = defineEmits<{
  (e: 'submit', data: FormData): Promise<void>
}>()

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const formData = reactive<FormData>({
  date: '',
  time: '',
  name: '',
  email: '',
  phone: '',
  guests: 1,
  specialRequests: ''
})

const errors = reactive<FormErrors>({})

const availableTimeSlots = computed<TimeSlot[]>(() => {
  // Generate time slots from 9 AM to 9 PM
  const slots: TimeSlot[] = []
  for (let hour = 9; hour <= 21; hour++) {
    const time = `${hour.toString ().padStart(2, '0')}:00`
    slots.push({
      value: time,
      label: new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    })
  }
  return slot
})

const validateForm = (): boolean => {
  const newErrors: FormErrors = {}
  let isValid = true

  // Date validation
  if (!formData.date) {
    newErrors.date = 'Please select a date'
    isValid = false
  }

  // Time validation
  if (!formData.time) {
    newErrors.time = 'Please select a time'
    isValid = false
  }

  // Name validation
  if (!formData.name.trim ()) {
    newErrors.name = 'Please enter your name'
    isValid = false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email.trim ()) {
    newErrors.email = 'Please enter your email'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    newErrors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Phone validation
  const phoneRegex = /^\+?[\d\s-()]{10,}$/
  if (!formData.phone.trim ()) {
    newErrors.phone = 'Please enter your phone number'
    isValid = false
  } else if (!phoneRegex.test(formData.phone)) {
    newErrors.phone = 'Please enter a valid phone number'
    isValid = false
  }

  // Guests validation
  if (!formData.guests || formData.guests < 1) {
    newErrors.guests = 'Please select number of guests'
    isValid = false
  } else if (props.maxGuests && formData.guests > props.maxGuests) {
    newErrors.guests = `Maximum ${props.maxGuests} guests allowed`
    isValid = false
  }

  Object.assign(errors, newErrors)
  return isValid
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm ()) return

  isSubmitting.value = true
  submitError.value = null

  try {
    await emit('submit', { ...formData })
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'Failed to submit reservation'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.reservation-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &__header {
    margin-bottom: 2rem;
    text-align: center;
  }

  &__title {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__subtitle {
    margin: 0;
    color: var(--text-color-light);
    font-size: 0.875rem;
  }

  &__fields {
    margin-bottom: 2rem;
  }

  &__row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;

    @media(min-width: 768px) {
      gap: 1.5rem;
    }
  }

  &__field {
    position: relative;
  }

  &__label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);

    &--error {
      color: var(--error-color);
    }
  }

  &__input,
  &__textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    color: var(--text-color);
    background: var(--white);
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: var(--aba-blue);
      box-shadow: 0 0 0 2px rgba(var(--aba-blue-rgb), 0.1);
    }

    &--error {
      border-color: var(--error-color);
    }
  }

  &__textarea {
    resize: vertical;
    min-height: 100px;
  }

  &__error {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--error-color);

    &--global {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--error-bg);
      border-radius: 4px;
    }
  }

  &__help-text {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-color-light);
  }

  &__actions {
    display: flex;
    justify-content: center;
  }

  &__submit {
    min-width: 200px;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    color: var(--white);
    background: var(--aba-blue);
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;

    &:hover:not(:disabled) {
      background: var(--aba-blue-dark);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &__spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--white);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
