import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alerts';

const stripePromise = loadStripe(
  'pk_test_51Q6z9UEAKKUC5LAHFEzjLEcNNbS0l7C9TeTioXvXuaeZfJlWzb8076uPsYGiVYOR1SlT8kYiov3U4d0Ea1buFHfr005MdB2BWw',
);
import axios from 'axios';

export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    const stripe = await stripePromise;
    const error = await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    if (error) throw new Error(error);
  } catch (err) {
    console.log(err);
    showAlert('Error', err);
  }
};
