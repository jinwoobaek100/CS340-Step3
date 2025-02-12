// public/js/client.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Add Store Form
    if (document.getElementById('store-form')) {
        document.getElementById('store-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await fetch('/api/stores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                alert('Store added successfully!');
                e.target.reset();
            } catch (error) {
                alert('Failed to add store!');
            }
        });
    }

    // 2. Add Customer Form
    if (document.getElementById('customer-form')) {
        document.getElementById('customer-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                alert('Customer added successfully!');
                e.target.reset();
            } catch (error) {
                alert('Failed to add customer!');
            }
        });
    }

    // 3. Add Employee Form
    if (document.getElementById('employee-form')) {
        document.getElementById('employee-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await fetch('/api/employees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                alert('Employee added successfully!');
                e.target.reset();
            } catch (error) {
                alert('Failed to add employee!');
            }
        });
    }

    // 4. Add Menu Item Form
    if (document.getElementById('menuitem-form')) {
        document.getElementById('menuitem-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await fetch('/api/menuitems', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                alert('Menu item added successfully!');
                e.target.reset();
            } catch (error) {
                alert('Failed to add menu item!');
            }
        });
    }

    // 5. Add Order Form
    if (document.getElementById('order-form')) {
        document.getElementById('order-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                alert('Order added successfully!');
                e.target.reset();
            } catch (error) {
                alert('Failed to add order!');
            }
        });
    }
});
