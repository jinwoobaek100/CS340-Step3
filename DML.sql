-- Query for SELECT all Customers
SELECT * FROM Customers;

-- Query for SELECT all Employees with related information
SELECT e.employeeID, s.streetAddress, e.firstName, e.lastName, p.positionName , e.hireDate
FROM Employees e
JOIN Stores s ON s.storeID = e.storeID
JOIN Positions p ON p.positionID = e.positionID;

-- Query for SELECT all MenuItems
SELECT * FROM MenuItems;

-- Query for SELECT all OrderItems with related information
SELECT oi.orderItemID, oi.orderID, m.itemName, oi.quantity, oi.itemPrice
FROM OrderItems oi
JOIN MenuItems m ON m.menuItemID = oi.menuItemID;

-- Query for SELECT all Orders with related information
SELECT o.orderID, s.streetAddress, 
       CONCAT(c.firstName, ' ', c.lastName) AS customer_name, o.orderDate, o.totalAmount, o.orderStatus
FROM Orders o
JOIN Stores s ON o.storeID = s.storeID
JOIN Customers c ON c.customerID = o.customerID;

-- Query for SELECT all Phones with customer information
SELECT p.phoneID,
       CONCAT(c.firstName, ' ', c.lastName) AS customer_name , p.phoneCountryCode, p.phoneAreaCode, p.phoneNumber
FROM Phones p
JOIN Customers c ON c.customerID = p.customerID;

-- Query for SELECT all Positions
SELECT * FROM Positions;

-- Query for SELECT all StorePositions with related information
SELECT sp.storePositionID, s.streetAddress, p.positionName 
FROM StorePositions sp
JOIN Stores s ON s.storeID = sp.storeID
JOIN Positions p ON p.positionID = sp.positionID;

-- Query for SELECT all Stores
SELECT * FROM Stores;

-- Query for INSERT Customers
INSERT INTO Customers (firstName, lastName, email, loyaltyPoints) VALUES
($firstName$, $lastName$, $email$, $loyaltyPoints$);

-- Query for INSERT Employees
INSERT INTO Employees (storeID, firstName, lastName, positionID, hireDate) VALUES
($storeID$, $firstName$, $lastName$, $positionID$, $hireDate$);

-- Query for INSERT MenuItems
INSERT INTO MenuItems (itemName, description, price, category) VALUES
($itemName$, $description$, $price$, $category$);

-- Query for INSERT OrderItems
INSERT INTO OrderItems (orderID, menuItemID, quantity, itemPrice) VALUES
($orderID$, $menuItemID$, $quantity$, $itemPrice$);

-- Query for INSERT Orders
INSERT INTO Orders (storeID, customerID, orderDate, totalAmount, orderStatus) VALUES
($storeID$, $customerID$, $orderDate$, $totalAmount$, $orderStatus$);

-- Query for INSERT Phones
INSERT INTO Phones (customerID, phoneCountryCode, phoneAreaCode, phoneNumber) VALUES
($customerID$, $phoneCountryCode$, $phoneAreaCode$, $phoneNumber$);

-- Query for INSERT Positions
INSERT INTO Positions (positionName) VALUES
($positionName$);

-- Query for INSERT StorePositions
INSERT INTO StorePositions (storeID, positionID) VALUES
($storeID$, $positionID$);

-- Query for INSERT Stores
INSERT INTO Stores (streetAddress, city, state, zipCode, phoneNumber) VALUES
($streetAddress$, $city$, $state$, $zipCode$, $phoneNumber$);

-- Query for UPDATE Customers
UPDATE Customers
SET firstName = $firstName$, lastName = $lastName$, email = $email$, loyaltyPoints = $loyaltyPoints$
WHERE customerID = $customerID$;

-- Query for UPDATE Employees
UPDATE Employees
SET storeID = $storeID$, firstName = $firstName$, lastName = $lastName$, positionID = $positionID$, hireDate = $hireDate$
WHERE employeeID = $employeeID$;

-- Query for UPDATE MenuItems
UPDATE MenuItems
SET itemName = $itemName$, description = $description$, price = $price$, category = $category$
WHERE menuItemID = $menuItemID$;

-- Query for UPDATE OrderItems
UPDATE OrderItems
SET orderID = $orderID$, menuItemID = $menuItemID$, quantity = $quantity$, itemPrice = $itemPrice$
WHERE orderItemID = $orderItemID$;

-- Query for UPDATE Orders
UPDATE Orders
SET storeID = $storeID$, customerID = $customerID$, orderDate = $orderDate$, totalAmount = $totalAmount$, orderStatus = $orderStatus$
WHERE orderID = $orderID$;

-- Query for UPDATE Phones
UPDATE Phones
SET customerID = $customerID$, phoneCountryCode = $phoneCountryCode$, phoneAreaCode = $phoneAreaCode$, phoneNumber = $phoneNumber$
WHERE phoneID = $phoneID$;

-- Query for UPDATE Positions
UPDATE Positions
SET positionName = $positionName$
WHERE positionID = $positionID$;

-- Query for UPDATE StorePositions positionID as NULL
UPDATE StorePositions
SET positionID = NULL
WHERE storeID = $selected_store$;

-- Query for UPDATE StorePositions
UPDATE StorePositions
SET positionID = $positionID$
WHERE storeID = $selected_store$;


-- Query for UPDATE Stores
UPDATE Stores
SET streetAddress = $streetAddress$, city = $city$, state = $state$, zipCode = $zipCode$, phoneNumber = $phoneNumber$
WHERE storeID = $storeID$;

-- Query for DELETE Customers
DELETE FROM Customers WHERE customerID = $customerID$;

-- Query for DELETE Employees
DELETE FROM Employees WHERE employeeID = $employeeID$;

-- Query for DELETE MenuItems
DELETE FROM MenuItems WHERE menuItemID = $menuItemID$;

-- Query for DELETE OrderItems
DELETE FROM OrderItems WHERE orderItemID = $orderItemID$;

-- Query for DELETE Orders
DELETE FROM Orders WHERE orderID = $orderID$;

-- Query for DELETE Phones
DELETE FROM Phones WHERE phoneID = $phoneID$;

-- Query for DELETE Positions
DELETE FROM Positions WHERE positionID = $positionID$;

-- Query for DELETE StorePositions
DELETE FROM StorePositions WHERE storePositionID = $storePositionID$;

-- Query for DELETE Stores
DELETE FROM Stores WHERE storeID = $storeID$;
