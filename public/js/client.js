// public/js/client.js
document.addEventListener('DOMContentLoaded', () => {
    setupFormHandlers();
    if (document.getElementById('stores-table')) {
        fetchStores();
    }
});

function setupFormHandlers() {
    const forms = {
        'store-form': '/api/stores',
        'customer-form': '/api/customers',
        'employee-form': '/api/employees',
        'menuitem-form': '/api/menuitems',
        'order-form': '/api/orders'
    };

    Object.entries(forms).forEach(([formId, url]) => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', handleFormSubmit(url, formId.split('-')[0]));
        }
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
            if (entityName === 'store') {
                fetchStores();
            }
        } catch (error) {
            console.error('Submission Error:', error);
            alert(`Failed to add ${entityName}: ${error.message}`);
        }
    };
}

async function fetchStores() {
  try {
    const response = await fetch('/api/stores');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Oops! We haven't received JSON!");
    }
    const stores = await response.json();
    populateStoreTable(stores);
    populateStateFilter(stores);
  } catch (error) {
    console.error('Fetch Error:', error);
    alert(`Failed to load stores: ${error.message}`);
  }
}

function populateStoreTable(stores) {
    const tableBody = document.querySelector('#stores-table tbody');
    tableBody.innerHTML = '';

    if(stores.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No stores found</td></tr>';
        return;
    }

    stores.forEach(store => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${store.storeID}</td>
            <td>${store.streetAddress}</td>
            <td>${store.city}</td>
            <td>${store.state}</td>
            <td>${store.zipCode}</td>
            <td>${store.phoneNumber}</td>
            <td>
                <button onclick="editStore(${store.storeID})">Edit</button>
                <button onclick="deleteStore(${store.storeID})">Delete</button>
            </td>
        `;
    });
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
        populateStoreTable(filteredStores);
    });
}

async function editStore(storeId) {
    try {
        const response = await fetch(`/api/stores/${storeId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const store = await response.json();
        
        // 모달 열기 및 데이터 채우기
        const modal = document.getElementById('update-modal');
        const form = document.getElementById('update-store-form');
        
        Object.keys(store).forEach(key => {
            const input = form.elements[key] || form.elements[`update-${key}`];
            if (input) input.value = store[key];
        });
        
        modal.style.display = 'block';

        // 모달 닫기 버튼 이벤트
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.style.display = 'none';

        // 폼 제출 이벤트
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const updateResponse = await fetch(`/api/stores/${storeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!updateResponse.ok) {
                    throw new Error(`HTTP error! status: ${updateResponse.status}`);
                }

                alert('Store updated successfully!');
                modal.style.display = 'none';
                fetchStores();
            } catch (error) {
                console.error('Update Error:', error);
                alert(`Failed to update store: ${error.message}`);
            }
        };
    } catch (error) {
        console.error('Edit Error:', error);
        alert(`Failed to load store data: ${error.message}`);
    }
}

async function deleteStore(storeId) {
    if (confirm('Are you sure you want to delete this store?')) {
        try {
            const response = await fetch(`/api/stores/${storeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Store deleted successfully!');
            fetchStores();
        } catch (error) {
            console.error('Delete Error:', error);
            alert(`Failed to delete store: ${error.message}`);
        }
    }
}
