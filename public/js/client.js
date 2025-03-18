/* 
 * Citation for the following JavaScript code:
 * Date: 03/17/2025
 * Adapted from:
 * 
 * Source 1: Mozilla Developer Network (MDN) (October 2024) "Using Fetch API" [JavaScript Documentation]. Retrieved from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * Source 2: W3Schools (February 2024) "JavaScript Async and Await" [JavaScript Guide]. Retrieved from https://www.w3schools.com/js/js_async.asp
 * Source 3: Scaler Topics (November 2022) "DOM Manipulation in JavaScript" [JavaScript Guide]. Retrieved from https://www.scaler.com/topics/javascript-dom-manipulation/
 * Source 4: Sencha Blog (December 2023) "Event Handling in JavaScript: A Practical Guide With Examples" [JavaScript Tutorial]. Retrieved from https://www.sencha.com/blog/event-handling-in-javascript-a-practical-guide-with-examples/
 * Source 5: DEV Community (December 2023) "Fetch API, do you really know how to handle errors?" [JavaScript Guide]. Retrieved from https://dev.to/dionarodrigues/fetch-api-do-you-really-know-how-to-handle-errors-2gj0
 * Source 6: MDN Web Docs (October 2024) "Using FormData Objects" [Web API Documentation]. Retrieved from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects
 * Source 7: Steemit (January 2018) "How to use JavaScript to create Dynamic Drop-Down Lists" [JavaScript Tutorial]. Retrieved from https://steemit.com/utopianio/@yissakhar/how-to-use-javascript-to-create-dynamic-drop-down-lists
 * Source 8: Stack Overflow (October 2018) "How can I populate a table with JavaScript?" [Community Discussion]. Retrieved from https://stackoverflow.com/questions/52919972/how-can-i-populate-a-table-with-javascript
 * Source 9: Next.js Documentation (February 2020) "Data Fetching Patterns and Best Practices" [React Framework Guide]. Retrieved from https://nextjs.org/docs/14/app/building-your-application/data-fetching/patterns
 * Source 10: W3Schools (March 2024) "JavaScript DOM Event Listeners" [JavaScript Guide]. Retrieved from https://www.w3schools.com/js/js_htmldom_eventlistener.asp
 */

document.addEventListener('DOMContentLoaded', () => {
    setupFormHandlers();
    setupTableHandlers();
    populateDropdowns();
});

function setupFormHandlers() {
    const forms = {
        'store-form': '/api/stores',
        'customer-form': '/api/customers',
        'menuitem-form': '/api/menuitems',
        'order-form': '/api/orders',
        'phone-form': '/api/phones',
        'orderitem-form': '/api/orderitems',
        'position-form': '/api/positions',
        'employee-form': '/api/employees',
        'storeposition-form': '/api/storepositions'
    };

    Object.entries(forms).forEach(([formId, url]) => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', handleFormSubmit(url, formId.split('-')[0]));
        }
    });
}

function setupTableHandlers() {
    const tables = [
        'stores', 'customers', 'menuitems', 'orders', 'phones',
        'orderitems', 'positions', 'employees', 'storepositions'
    ];

    tables.forEach(table => {
        if (document.getElementById(`${table}-table`)) {
            fetchEntities(table);
        }
    });
}

async function populateDropdowns() {
    const dropdowns = {
        'storeID': { entity: 'stores', valueField: 'storeID', displayField: 'city' },
        'customerID': { entity: 'customers', valueField: 'customerID', displayField: 'lastName' },
        'menuItemID': { entity: 'menuitems', valueField: 'menuItemID', displayField: 'itemName' },
        'orderID': { entity: 'orders', valueField: 'orderID', displayField: 'orderID' },
        'positionID': { entity: 'positions', valueField: 'positionID', displayField: 'positionName' }
    };

    for (const [selectId, config] of Object.entries(dropdowns)) {
        const select = document.getElementById(selectId);
        if (select) {
            const entities = await fetchEntities(config.entity);
            populateDropdown(select, entities, config.valueField, config.displayField);
        }
    }
}

function populateDropdown(select, data, valueField, displayField) {
    select.innerHTML = '<option value="">Select an option</option>';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = `${item[valueField]} - ${item[displayField]}`;
        select.appendChild(option);
    });
}

function handleFormSubmit(url, entityName) {
    return async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert(`${entityName} added successfully!`);
            e.target.reset();
            fetchEntities(entityName + 's');
        } catch (error) {
            console.error('Submission Error:', error);
            alert(`Failed to add ${entityName}: ${error.message}`);
        }
    };
}

async function fetchEntities(entityName) {
    try {
        const response = await fetch(`/api/${entityName}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const entities = await response.json();
        
        // 테이블 채우기
        if (document.getElementById(`${entityName}-table`)) {
            populateTable(entityName, entities);
        }

        if (entityName === 'stores') {
            populateStateFilter(entities);
        } else if (entityName === 'customers') {
            populateLoyaltyFilter(entities);
        } else if (entityName === 'employees') {
            populatePositionFilter(entities);
        } else if (entityName === 'menuitems') {
            populateCategoryFilter(entities);
        } else if (entityName === 'orderitems') {
            populateMenuFilter(entities);
        } else if (entityName === 'orders') {
            populateStoreFilter(entities);
            populateCustomerFilter(entities);
            populateStatusFilter(entities);
        } else if (entityName === 'phones') {
            populateAreacodeFilter(entities);
        } else if (entityName === 'storepositions') {
            populateStoreFilterForSP(entities);
            populatePositionFilterForSP(entities);
        } else if (entityName === 'positions') {
            populatePositionTypeFilter(entities);
        }

        return entities;
    } catch (error) {
        console.error('Fetch Error:', error);
        alert(`Failed to load ${entityName}: ${error.message}`);
        return [];
    }
}

async function populateTable(entityName, entities) {
 const tableBody = document.querySelector(`#${entityName}-table tbody`);
 if (!tableBody) return;

 tableBody.innerHTML = '';

 if(entities.length === 0) {
     tableBody.innerHTML = `<tr><td colspan="7">No ${entityName} found</td></tr>`;
     return;
 }

 for (const entity of entities) {
     const row = tableBody.insertRow();
     let order, menuItem; // Declare variables to hold fetched entities
console.log(entity);
     // Fetch related entities if this is the orderitems table
     if (entityName === 'orderitems') {
         try {
             order = await fetchRelatedEntity('order', entity.orderID, 'orders');
         } catch (error) {
             console.error('Error fetching order:', error);
             order = null; // Set order to null to prevent further errors
         }
         try {
             menuItem = await fetchRelatedEntity('menuitem', entity.menuItemID, 'menuitems');
         } catch (error) {
             console.error('Error fetching menuitem:', error);
             menuItem = null; // Set menuItem to null to prevent further errors
         }
     }

     for (const key in entity) {
         const cell = row.insertCell();
         if (key === 'orderID' && order) {
             cell.textContent = `${entity.orderID} - Order ${order.orderID}`; // Access the orderID
         } else if (key === 'menuItemID' && menuItem) {
             cell.textContent = `${entity.menuItemID} - ${menuItem.itemName}`; // Access the itemName
         } else {
             cell.textContent = entity[key];
         }
     }

     const actionsCell = row.insertCell();
     const entityIdNameMap = {
        orderitems: 'orderItemID',
        menuitems: 'menuItemID',
        storepositions: 'storePositionID'
    };
    const entityIdName = entityIdNameMap[entityName] || entityName.slice(0, -1) + 'ID';
     console.log(entityIdName);
     actionsCell.innerHTML = `
         <button onclick="editEntity('${entityName}', ${entity[entityIdName]} )">Update</button>
         <button onclick="deleteEntity('${entityName}', ${entity[entityIdName]} )">Delete</button>
     `;
 }
}

async function fetchRelatedEntity(prefix, id, entityName) {
    try {
        const response = await fetch(`/api/${entityName}/${id}`);
        if (!response.ok) return null;
        const entity = await response.json();
        return entity;
    } catch (error) {
        console.error(`Error fetching related ${entityName}:`, error);
        return null;
    }
}

function populateStateFilter(stores) {
    const stateFilter = document.getElementById('state-filter');
    if (!stateFilter) return;

    const states = [...new Set(stores.map(store => store.state))];
    stateFilter.innerHTML = '<option value="">All States</option>';
    states.forEach(state => {
        stateFilter.innerHTML += `<option value="${state}">${state}</option>`;
    });

    stateFilter.addEventListener('change', () => {
        const selectedState = stateFilter.value;
        const filteredStores = selectedState 
            ? stores.filter(store => store.state === selectedState)
            : stores;
        populateTable('stores', filteredStores);
    });
}

function populateLoyaltyFilter(customers) {
    const loyaltyFilter = document.getElementById('loyalty-filter');
    if (!loyaltyFilter) return;

    loyaltyFilter.addEventListener('change', () => {
        const selectedFilter = loyaltyFilter.value;
        let filteredCustomers;

        switch(selectedFilter) {
            case '<100':
                filteredCustomers = customers.filter(customer => customer.loyaltyPoints < 100);
                break;
            case '<500':
                filteredCustomers = customers.filter(customer => customer.loyaltyPoints < 500);
                break;
            case '<1000':
                filteredCustomers = customers.filter(customer => customer.loyaltyPoints < 1000);
                break;
            case '>=1000':
                filteredCustomers = customers.filter(customer => customer.loyaltyPoints >= 1000);
                break;
            default:
                filteredCustomers = customers;
        }

        populateTable('customers', filteredCustomers);
    });
}

function populatePositionFilter(employees) {
    const positionFilter = document.getElementById('position-filter');
    if (!positionFilter) return;

    // Extract unique positions
    const positions = [...new Set(employees.map(employee => employee.positionName))];
    
    // Populate the filter dropdown
    positionFilter.innerHTML = '<option value="">All Positions</option>';
    positions.forEach(position => {
        positionFilter.innerHTML += `<option value="${position}">${position}</option>`;
    });

    // Add event listener for filtering
    positionFilter.addEventListener('change', () => {
        const selectedPosition = positionFilter.value;
        const filteredEmployees = selectedPosition 
            ? employees.filter(employee => employee.positionName === selectedPosition)
            : employees;
        populateTable('employees', filteredEmployees);
    });
}

function populateCategoryFilter(menuitems) {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    // Extract unique categories
    const categories = [...new Set(menuitems.map(item => item.category))];
    
    // Populate the filter dropdown
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });

    // Add event listener for filtering
    categoryFilter.addEventListener('change', () => {
        const selectedCategory = categoryFilter.value;
        const filteredMenuItems = selectedCategory 
            ? menuitems.filter(item => item.category === selectedCategory)
            : menuitems;
        populateTable('menuitems', filteredMenuItems);
    });
}

function populateMenuFilter(orderitems) {
    const menuFilter = document.getElementById('menu-filter');
    if (!menuFilter) return;

    // Extract unique menu items
    const menuItems = [...new Set(orderitems.map(orderItem => orderItem.itemName))];

    // Populate the filter dropdown
    menuFilter.innerHTML = '<option value="">All Menu Items</option>';
    menuItems.forEach(item => {
        menuFilter.innerHTML += `<option value="${item}">${item}</option>`;
    });

    // Add event listener for filtering
    menuFilter.addEventListener('change', () => {
        const selectedMenuItem = menuFilter.value;
        const filteredOrderItems = selectedMenuItem 
            ? orderitems.filter(orderItem => orderItem.itemName === selectedMenuItem)
            : orderitems;
        populateTable('orderitems', filteredOrderItems);
    });
}

function applyOrderFilters(orders) {
    const selectedStore = document.getElementById('store-filter').value;
    const selectedCustomer = document.getElementById('customer-filter').value;
    const selectedStatus = document.getElementById('status-filter').value;

    return orders.filter(order => {
        const storeMatch = !selectedStore || order.streetAddress === selectedStore;
        const customerMatch = !selectedCustomer || order.customer_name === selectedCustomer;
        const statusMatch = !selectedStatus || order.orderStatus === selectedStatus;
        return storeMatch && customerMatch && statusMatch;
    });
}

function populateStoreFilter(orders) {
    const storeFilter = document.getElementById('store-filter');
    if (!storeFilter) return;

    const stores = [...new Set(orders.map(order => order.streetAddress))];
    
    storeFilter.innerHTML = '<option value="">All Stores</option>';
    stores.forEach(store => {
        storeFilter.innerHTML += `<option value="${store}">${store}</option>`;
    });

    storeFilter.addEventListener('change', () => {
        const filtered = applyOrderFilters(orders);
        populateTable('orders', filtered);
    });
}

function populateCustomerFilter(orders) {
    const customerFilter = document.getElementById('customer-filter');
    if (!customerFilter) return;

    const customers = [...new Set(orders.map(order => order.customer_name))];
    
    customerFilter.innerHTML = '<option value="">All Customers</option>';
    customers.forEach(customer => {
        customerFilter.innerHTML += `<option value="${customer}">${customer}</option>`;
    });

    customerFilter.addEventListener('change', () => {
        const filtered = applyOrderFilters(orders);
        populateTable('orders', filtered);
    });
}

function populateStatusFilter(orders) {
    const statusFilter = document.getElementById('status-filter');
    if (!statusFilter) return;

    statusFilter.innerHTML = `
        <option value="">All Statuses</option>
        <option value="Preparing">Preparing</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
    `;

    statusFilter.addEventListener('change', () => {
        const filtered = applyOrderFilters(orders);
        populateTable('orders', filtered);
    });
}

function populateAreacodeFilter(phones) {
    const areacodeFilter = document.getElementById('areacode-filter');
    if (!areacodeFilter) return;

    // Extract unique area codes
    const areaCodes = [...new Set(phones.map(phone => phone.phoneAreaCode))];

    // Populate the filter dropdown
    areacodeFilter.innerHTML = '<option value="">All Area Codes</option>';
    areaCodes.forEach(areaCode => {
        areacodeFilter.innerHTML += `<option value="${areaCode}">${areaCode}</option>`;
    });

    // Add event listener for filtering
    areacodeFilter.addEventListener('change', () => {
        const selectedAreaCode = areacodeFilter.value;
        const filteredPhones = selectedAreaCode
            ? phones.filter(phone => phone.phoneAreaCode === selectedAreaCode)
            : phones;
        populateTable('phones', filteredPhones);
    });
}

function applyStorePositionsFilters(storepositions) {
    const selectedStore = document.getElementById('store-filter').value;
    const selectedPosition = document.getElementById('position-filter').value;

    return storepositions.filter(sp => {
        const storeMatch = !selectedStore || sp.streetAddress === selectedStore;
        const positionMatch = !selectedPosition || sp.positionName === selectedPosition;
        return storeMatch && positionMatch;
    });
}

function populateStoreFilterForSP(storepositions) {
    const storeFilter = document.getElementById('store-filter');
    if (!storeFilter) return;

    const stores = [...new Set(storepositions.map(sp => sp.streetAddress))];
    
    storeFilter.innerHTML = '<option value="">All Stores</option>';
    stores.forEach(store => {
        storeFilter.innerHTML += `<option value="${store}">${store}</option>`;
    });

    storeFilter.addEventListener('change', () => {
        const filtered = applyStorePositionsFilters(storepositions);
        populateTable('storepositions', filtered);
    });
}

function populatePositionFilterForSP(storepositions) {
    const positionFilter = document.getElementById('position-filter');
    if (!positionFilter) return;

    const positions = [...new Set(storepositions.map(sp => sp.positionName))];
    
    positionFilter.innerHTML = '<option value="">All Positions</option>';
    positions.forEach(position => {
        positionFilter.innerHTML += `<option value="${position}">${position}</option>`;
    });

    positionFilter.addEventListener('change', () => {
        const filtered = applyStorePositionsFilters(storepositions);
        populateTable('storepositions', filtered);
    });
}

function populatePositionTypeFilter(positions) {
    const positionTypeFilter = document.getElementById('position-type-filter');
    if (!positionTypeFilter) return;

    const positionTypes = [...new Set(positions.map(pos => pos.positionName))];

    positionTypeFilter.innerHTML = '<option value="">All Position Types</option>';
    positionTypes.forEach(position => {
        positionTypeFilter.innerHTML += `<option value="${position}">${position}</option>`;
    });

    positionTypeFilter.addEventListener('change', () => {
        const selectedPosition = positionTypeFilter.value;
        const filteredPositions = selectedPosition
            ? positions.filter(pos => pos.positionName === selectedPosition)
            : positions;
        populateTable('positions', filteredPositions);
    });
}

async function editEntity(entityName, entityId) {
    try {
        const response = await fetch(`/api/${entityName}/${entityId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const entity = await response.json();

        const modal = document.getElementById('update-modal');
        const form = document.getElementById(`update-${entityName.slice(0, -1)}-form`);

        modal.style.display = 'block';

        // Reload dropdowns for the edit form, passing the form as a parameter
        await reloadDropdownsForEdit(entityName, form);

        // Populate the form fields with the fetched entity data
        for (const key in entity) {
            const input = form.elements[key]; // Access elements directly by name

            if (input) {
                if (input.tagName === 'SELECT') {
                    input.value = entity[key];  // Select the current option
                } else {
                    input.value = entity[key];
                }
            }
        }

        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.style.display = 'none';

        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const updateResponse = await fetch(`/api/${entityName}/${entityId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!updateResponse.ok) {
                    throw new Error(`HTTP error! status: ${updateResponse.status}`);
                }

                alert(`${entityName.slice(0, -1)} updated successfully!`);
                modal.style.display = 'none';
                fetchEntities(entityName);
            } catch (error) {
                console.error('Update Error:', error);
                alert(`Failed to update ${entityName.slice(0, -1)}: ${error.message}`);
            }
        };
    } catch (error) {
        console.error('Edit Error:', error);
        alert(`Failed to load ${entityName.slice(0, -1)} data: ${error.message}`);
    }
}

async function reloadDropdownsForEdit(entityName, form) {
    const dropdownConfig = {
        'orders': [
            { id: 'update-storeID', entity: 'stores', value: 'storeID', display: 'city' },
            { id: 'update-customerID', entity: 'customers', value: 'customerID', display: 'lastName' }
        ],
        'phones': [
            { id: 'update-customerID', entity: 'customers', value: 'customerID', display: 'lastName' }  
        ],
        'employees': [
            { id: 'update-storeID', entity: 'stores', value: 'storeID', display: 'city' },
            { id: 'update-positionID', entity: 'positions', value: 'positionID', display: 'positionName' }
        ],
        'storepositions': [
            { id: 'update-storeID', entity: 'stores', value: 'storeID', display: 'city' },
            { id: 'update-positionID', entity: 'positions', value: 'positionID', display: 'positionName' }
        ],
        'orderitems': [
            { id: 'update-orderID', entity: 'orders', value: 'orderID', display: 'orderID' },
            { id: 'update-menuItemID', entity: 'menuitems', value: 'menuItemID', display: 'itemName' }
        ]
    };

    const config = dropdownConfig[entityName] || [];
    for (const { id, entity, value, display } of config) {
        // Use the passed form to find the select element within the modal
        const select = document.getElementById(id);
        if (!select) continue;

        const data = await fetchEntities(entity);
        select.innerHTML = '<option value="">Select an option</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[value];
            option.textContent = `${item[value]} - ${item[display]}`;
            select.appendChild(option);
        });
    }
}

async function deleteEntity(entityName, entityId) {
    if (confirm(`Are you sure you want to delete this ${entityName.slice(0, -1)} ${entityId}?`)) {
        try {
            const response = await fetch(`/api/${entityName}/${entityId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert(`${entityName.slice(0, -1)} deleted successfully!`);
            fetchEntities(entityName);
        } catch (error) {
            console.error('Delete Error:', error);
            alert(`Failed to delete ${entityName.slice(0, -1)}: ${error.message}`);
        }
    }
}
