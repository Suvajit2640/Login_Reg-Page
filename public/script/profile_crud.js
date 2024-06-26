
let newValue;
let textarea;
let item;
let fieldName;
let listItem;
let oldvalue
const done = document.querySelector(".done")
const edit = async (e) => {
    try {
        listItem = e.target.closest('li');
        fieldName = listItem.querySelector('h2').id;
        textarea = document.createElement("textarea")
        item = listItem.querySelector("h3")
        oldvalue = item.innerText;

        item.innerHTML = "";
        item.appendChild(textarea)
        document.querySelectorAll('.editbtn').forEach(button => {
            button.removeEventListener('click', edit)

        });
    }
    catch (error) {
        console.log('error updating profile', error);

    }



};
document.querySelectorAll('.editbtn').forEach(button => {
    button.addEventListener('click', edit)
});

done.addEventListener("click", async () => {
    try {
        newValue = textarea.value;
        // const newValue = prompt(`Enter new ${fieldName}:`);
        console.log('newvalue', fieldName, newValue);

        if (newValue !== null) {
            const data = { field: fieldName, value: newValue };
            // console.log('data', data);
            const response = await fetch('/profile-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'//specifies that the request body contains json data
                },
                body: JSON.stringify(data)
            })
            console.log('response', response);
            const updatedProfile = await response.json();

            listItem.querySelector('h3').innerText = updatedProfile[data.field];

            newValue = "";
            document.querySelectorAll('.editbtn').forEach(button => {
                button.addEventListener('click', edit)

            });


            if (response.status == 500) {
                alert("ERROR!!Can't Update,Try again")
                console.error("problem in updation client side")
                listItem.querySelector("h3").innerText = oldvalue;
                // console.log('response 500');


            }
        }
    } catch (error) {
        console.log('error in saving updated profile', error);

    }

})


const Delete = document.querySelector(".Delete")
Delete.addEventListener("click", async () => {
    try {
        const confirmation = confirm("Your Account and All your Accounts Data will be permanently deleted!! Are you sure?")
        if (confirmation) {
            let response = await fetch("/profile-delete", { method: "POST" })
            if (response.status == 200) {


                window.location.href = "/";


            }

        }
    } catch (error) {
        console.log('error occur in removing profile', error);

    }



})
