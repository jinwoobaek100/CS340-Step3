document.addEventListener('DOMContentLoaded', () => {
    setupFormHandlers();
    setupTableHandlers();
    populateDropdowns();
    setupSearch();
});

function setupSearch() {
    const searchButton = document.getElementById('search-button');
    const storeSearchInput = document.getElementById('store-search');
    
    searchButton.addEventListener('click', () => performSearch(storeSearchInput.value));
    storeSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(storeSearchInput.value);
        }
    });
}

async function performSearch(searchTerm) {
    if (!searchTerm) {
        alert('Please enter a search term.');
        return;
    }

    try {
        const response = await fetch(`/api/search?term=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search Error:', error);
        alert(`Search failed: ${error.message}`);
    }
}

function displaySearchResults(results) {
  const searchResultsDiv = document.getElementById('search-results');
  searchResultsDiv.innerHTML = '';

  if (results.length === 0) {
    searchResultsDiv.textContent = 'No results found.';
    return;
  }

  const entities = [...new Set(results.map(r => r.entity))];
  
  entities.forEach(entity => {
    const entityResults = results.filter(r => r.entity === entity);
    const table = document.createElement('table');
    table.innerHTML = `<caption>${entity}</caption><thead><tr></tr></thead><tbody></tbody>`;

    const headers = Object.keys(entityResults[0]).filter(k => k !== 'entity');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      table.querySelector('thead tr').appendChild(th);
    });

    entityResults.forEach(result => {
      const row = table.querySelector('tbody').insertRow();
      headers.forEach(header => {
        const cell = row.insertCell();
        cell.textContent = result[header];
      });
    });

    searchResultsDiv.appendChild(table);
  });
}


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
        'menuID': { entity: 'menuitems', valueField: 'menuID', displayField: 'itemName' },
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Oops! We haven't received JSON!");
        }
        const entities = await response.json();
        if (document.getElementById(`${entityName}-table`)) {
            populateTable(entityName, entities);
        }
        if (entityName === 'stores') {
            populateStateFilter(entities);
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

     // Fetch related entities if this is the orderitems table
     if (entityName === 'orderitems') {
         try {
             order = await fetchRelatedEntity('order', entity.orderID, 'orders');
         } catch (error) {
             console.error('Error fetching order:', error);
             order = null; // Set order to null to prevent further errors
         }
         try {
             menuItem = await fetchRelatedEntity('menuitem', entity.menuID, 'menuitems');
         } catch (error) {
             console.error('Error fetching menuitem:', error);
             menuItem = null; // Set menuItem to null to prevent further errors
         }
     }

     for (const key in entity) {
         const cell = row.insertCell();
         if (key === 'orderID' && order) {
             cell.textContent = `${entity.orderID} - Order ${order.orderID}`; // Access the orderID
         } else if (key === 'menuID' && menuItem) {
             cell.textContent = `${entity.menuID} - ${menuItem.itemName}`; // Access the itemName
         } else {
             cell.textContent = entity[key];
         }
     }

     const actionsCell = row.insertCell();
     const entityIdName = entityName.slice(0, -1) + 'ID'; // Dynamically determine ID field
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

async function editEntity(entityName, entityId) {
    try {
        const response = await fetch(`/api/${entityName}/${entityId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const entity = await response.json();
        
        const modal = document.getElementById('update-modal');
        const form = document.getElementById(`update-${entityName.slice(0, -1)}-form`);
        
        for (const key in entity) {
            const input = form.elements[key]; // Access elements directly by name

            if (input) {
                if (input.tagName === 'SELECT') {
                    input.value = entity[key];  // Set the selected option
                } else {
                    input.value = entity[key];
                }
            }
        }
        
        modal.style.display = 'block';

        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.style.display = 'none';

        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const updateResponse = await fetch(`/api/${entityName}/${entityId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
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

async function deleteEntity(entityName, entityId) {
    if (confirm(`Are you sure you want to delete this ${entityName.slice(0, -1)}?`)) {
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
