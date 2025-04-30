/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - telephoneNumber
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: password123
 *         telephoneNumber:
 *           type: string
 *           example: "0123456789"
 *         role:
 *           type: string
 *           enum: [car-renter, car-owner, admin]
 *           example: car-renter
 *         driverLicense:
 *           type: string
 *           example: "DL12345678"
 *
 *     Car:
 *       type: object
 *       required:
 *         - make
 *         - model
 *         - year
 *         - numberPlates
 *         - description
 *         - rentalPrice
 *         - color
 *         - transmission
 *         - fuelType
 *       properties:
 *         make:
 *           type: string
 *           example: Toyota
 *         model:
 *           type: string
 *           example: Camry
 *         year:
 *           type: number
 *           example: 2022
 *         numberPlates:
 *           type: string
 *           example: ABC123
 *         description:
 *           type: string
 *           example: Comfortable sedan with good fuel economy
 *         rentalPrice:
 *           type: number
 *           example: 50
 *         color:
 *           type: string
 *           example: Silver
 *         transmission:
 *           type: string
 *           enum: [automatic, manual]
 *           example: automatic
 *         fuelType:
 *           type: string
 *           enum: [petrol, diesel, electric, hybrid]
 *           example: petrol
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["GPS", "Bluetooth", "Backup Camera"]
 *
 *     Reservation:
 *       type: object
 *       required:
 *         - carId
 *         - pickUpDate
 *         - returnDate
 *       properties:
 *         carId:
 *           type: string
 *           example: "60d725c6b0c7c1b8d0f0e5a1"
 *         pickUpDate:
 *           type: string
 *           format: date-time
 *           example: "2024-03-20T10:00:00Z"
 *         returnDate:
 *           type: string
 *           format: date-time
 *           example: "2024-03-25T10:00:00Z"
 *
 *     Rating:
 *       type: object
 *       required:
 *         - score
 *         - comment
 *       properties:
 *         score:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         comment:
 *           type: string
 *           maxLength: 500
 *           example: "Great car, very clean and runs smoothly"
 */