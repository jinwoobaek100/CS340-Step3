-- Query for add a new character functionality with dollar sign $ character being used to 
-- denote the variables that will have data from the backend programming language.
SELECT * FROM Customers;

SELECT employeeID, firstName, lastName, hireDate, Stores.streetAddress, Positions.positionName FROM Employees
JOIN Stores ON Stores.storeID = Employees.storeID
JOIN Positions ON Positions.positionID = Employees.positionID;

SELECT * FROM MenuItems;

SELECT orderItemID, quantity, itemPrice, MenuItems.itemName, orderID 
FROM OrderItems 
JOIN MenuItems ON MenuItems.menuID = OrderItems.menuID
WHERE orderID = $orderID;

SELECT orderID, orderDate, totalAmount, orderStatus, Stores.streetAddress,
 CONCAT(Customers.firstName, ' ', Customers.lastName) AS customer_name 
FROM Orders
JOIN Stores ON Orders.storeID = Stores.storeID
JOIN Customers ON Customers.customerID = Orders.customerID;

SELECT phoneID, phoneCountryCode, phoneAreaCode, phoneNumber, 
CONCAT(Customers.firstName, ' ', Customers.lastName) AS customer_name 
FROM Phones
JOIN Customers ON Customers.customerID = Phones.customerID;

SELECT * FROM Positions;

SELECT storePositionID, Stores.streetAddress, Positions.positionName 
FROM StorePositions 
JOIN Stores ON Stores.storeID = StorePositions.storeID
JOIN Positions ON Positions.positionID = StorePositions.positionID
WHERE StorePositions.storeID = $storeID;

SELECT * FROM Stores;

INSERT INTO Customers (firstName, lastName, email, loyaltyPoints) VALUES
($firstName, $lastName, $email, $loyaltyPoints);

INSERT INTO Employees (storeID, firstName, lastName, positionID, hireDate) VALUES
($storeID, $firstName, $lastName, $positionID, $hireDate);

INSERT INTO MenuItems (itemName, description, price, category) VALUES
($itemName, $description, $price, $category);

INSERT INTO OrderItems (orderID, menuID, quantity, itemPrice) VALUES
($orderID, $menuID, $quantity, $itemPrice);

INSERT INTO Orders (storeID, customerID, orderDate, totalAmount, orderStatus) VALUES
($storeID, $customerID, $orderDate, $totalAmount, $orderStatus);

INSERT INTO Phones (customerID, phoneCountryCode, phoneAreaCode, phoneNumber) VALUES
($customerID, $phoneCountryCode, $phoneAreaCode, $phoneNumber);

INSERT INTO Positions (positionName) VALUES 
($positionName);

INSERT INTO StorePositions (storeID, positionID) VALUES
($storeID, $positionID);

INSERT INTO Stores (streetAddress, city, state, zipCode, phoneNumber) VALUES
($streetAddress, $city, $state, $zipCode, $phoneNumber);

UPDATE StorePositions
SET positionID = NULL
WHERE storeID = $selected_store;

UPDATE Positions
SET positionName = $positionName
WHERE positionID = $selected_position;

DELETE FROM StorePositions WHERE storeID = $storeID AND positionID = $positionID LIMIT 1;
DELETE FROM Positions WHERE positionID = $positionID;
