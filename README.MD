Application Name: CodeHealth Pharmacy

Team Members:
- Hui Angeles
- Froilan Oliquiano

User Credentials:
- Admin User
	- email: admin@gmail.com
	- password: admin@123
- Dummy Customer
	- email: gojosatoru@gmail.com
	- password: gojosatoru@123


Features:
- USER
	- Added a feature in which the admin has a separate user registration. 
	- Address is now added as a part of the regular customer registration and not included in the admin registration since admins are not allowed to create an order. This will also help the admins in the near future to determine where they will ship the customers order.
		- Input Details (Normal User Registration) :
			{
			    "firstName": "Gojo",
			    "lastName": "Satoru",
			    "mobileNo": "09958978244",
			    "address": "123 Quezon City Heights",
			    "email": "gojosatoru@gmail.com",
			    "password": "gojosatoru@123"
			}

- PRODUCT
	- SEARCH FUNCTION
		- In price range search function, when the min price is greater than the maximum price, message ""Minimum price should be less than or equal to maximum price" will be sent to the user.
		- Added a search feature where users can also search by category.

- CART (1 USER - 1 CART)
	- ADD TO CART FUNCTION 
		- Input Body Fields are:
			- productId and quantity.
		- You can input many items as long as its quantity is not greater than the stock level. 
		- Multiple items are allowed to be added.
		- If productId is existing on the cart, the total, subtotal and updated quantity will proceed as expected.
		- If items are already out of stock, the item will be inactive automatically and status will be isActive:false.
	- UPDATE QUANTITY FUNCTION
		- Input Fields are: 
			- itemID and quantity.
		- This accepts a single item update as of the moment and will be updated once other requirements are completed.
		- The function is the same as the add to cart function, it also adds up the previous remaining quantity and updates the subtotal depending on the quantity given. 
	- CLEAR CART FUNCTION
		- An input is needed from the user in this part. A confirmation is needed if they will want to proceed with the cart clearing.
			- confirmation: yes = cart will proceed to clear and array of blank object will be returned 
			- confirmation: no = cart will not be cleared and it will return the original items in your cart.

- ORDER
	- PAYMENT METHOD FEATURE
		- I have decided to add a payment method feature in which users can pay via digital payments or cash on delivery option.
		- Additional route has been added which has an end point /payment-methods to view first the methods allowed.
	- CREATE ORDER FUNCTION
		- With the payment method added, users should now pay their orders on their cart before checking out.
		- For the create method order, input in the body field is required to proceed with the checkout.
			- List of allowable payment methods:
			- Credit Card, Debit Card, Maya, Gcash, and CodeHealth Wallet (which is the apps name :) ).
		- Field to be entered on the postman body:
			{
			    "paymentMethod": "credit card",
			    "userBalance": 145
			}
		- If the payment method is DIGITAL (Credit Card, Debit Card, Maya, Gcash, and CodeHealth Wallet), you will need to provide both paymentMethod and userBalance. In which case, the balance must be equal to the total amount. (example provided below)
			- Balance is less than total amount
				- Input:
					{
					    "paymentMethod": "credit card",
					    "userBalance": 10
					}
				- Output: 
					{
					    "message": "Insufficient balance. Your balance is less than the total amount.",
					    "amountToPay": "₱145"
					}
			- Balance is greater than total amount
				- Input: 
					{
					    "paymentMethod": "credit card",
					    "userBalance": 1000
					}
				- Output: 
					{
					    "message": "Balance is greater than your total price. Please enter the exact amount for digital payment methods.",
					    "amountToPay": "₱145"
					}
		- Once the payment is balanced on the userBalance and amountToPay, order will now proceed and PAYMENT STATUS will be changed to COMPLETE.
			- Balance is the same as the total amount.
				- Input: 
					{
					    "paymentMethod": "credit card",
					    "userBalance": 145
					}
				- Output (not all part):
					{
				        "totalPrice": "₱145.00",
				        "orderedOn": "2024-01-26T07:52:23.242Z",
				        "paymentMethod": "credit card",
				        "paymentStatus": "complete"
					}
		- If the payment is made via CASH ON DELIVERY, the order will just proceed and the PAYMENT STATUS will retain as PENDING.
	- SEARCH FUNCTION
		- Added a new feature in which all the pending orders will be retrieved. 


