// controllers/bookingController.js
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';

export const createBookingAfterLiqpay = async (req, res) => {
  const { tourId, price } = req.body;
  const user = req.user.id;

  try {
    const newBooking = await Booking.create({
      tour: tourId,
      user,
      price,
      paid: true,
    });

    res.status(201).json({
      status: 'success',
      data: {
        booking: newBooking,
      },
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    res
      .status(500)
      .json({ status: 'fail', message: 'Failed to create booking' });
  }
};
// controllers/bookingController.js

export const getMyBookedTours = catchAsync(async (req, res, next) => {
  // 1. Знаходимо всі бронювання користувача
  const bookings = await Booking.find({ user: req.user.id }).populate('tour');

  // 2. Витягуємо тури (тут ми вже отримуємо повну інформацію про тури через populate)
  const tours = bookings.map((booking) => booking.tour);

  // 3. Якщо тури не знайдені, повертаємо помилку
  if (!tours.length) {
    return next(new AppError('No tours found for this user', 404));
  }

  // 4. Логуємо айдішки турів в консоль
  console.log(
    'Booked tour IDs:',
    tours.map((tour) => tour._id),
  );

  // 5. Якщо потрібно, можемо також зробити додаткові запити, щоб отримати деталі турів.
  // Наприклад, якщо хочете витягнути ще інші поля з колекції турів, які не були повернуті через populate

  const fullTourDetails = await Tour.find({
    _id: { $in: tours.map((tour) => tour._id) },
  });

  res.status(200).json({
    status: 'success',
    results: fullTourDetails.length,
    data: {
      tours: fullTourDetails, // Повертаємо всі тури з повною інформацією
    },
  });
});
