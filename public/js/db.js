let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_order', { autoIncrement: true });
};

// Upon successfully creating the db when its object store or establish connection, save reference to global variable
request.onsuccess = function(event) {
    db = event.target.result;
    
    if (navigator.online) {
        checkDatabase();
    }
};

function saveRecord(record) {
    const transaction = db.transaction(['new_order'], 'readwrite');
    const store = transaction.objectStore('new_order');
    store.add(record);
};

function checkDatabase() {
    const transaction = db.transaction(['new_order'], 'readwrite');
    const store = transaction.objectStore('new_order');
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST', 
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_order'], 'readwrite');

                const store = transaction.objectStore('new_order');
                store.clear();

                alert('All transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', checkDatabase);