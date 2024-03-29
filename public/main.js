function onBtnSignIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      console.log(error.code);
      console.log(error.message);
    });
}

function onBtnSignUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      console.log(error.code);
      console.log(error.message);
    });
}

let user;
let unsubscribe;

firebase.auth().onAuthStateChanged((newUser) => {
  if (newUser) {
    user = newUser;
    document.getElementById("login-form").setAttribute("hidden", "hidden");
    const userPanel = document.getElementById("user-panel");
    userPanel.removeAttribute("hidden");
    userPanel.className = "user-panel";
    userPanel.innerHTML = getUserPanel();
  } else {
    document.getElementById("login-form").removeAttribute("hidden");
    let userPanel = document.getElementById("user-panel");
    userPanel.setAttribute("hidden", "hidden");
    userPanel.className = "";
    if (unsubscribe) unsubscribe();
  }
});

function onBtnSignOut() {
  firebase.auth().signOut();
}

function getUserPanel() {
  unsubscribe = firebase
    .firestore()
    .collection("things")
    .where("uid", "==", user.uid)
    .onSnapshot((querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => {
        return `
        <li>
        <input type="checkbox" name="list-item-checkbox" value="${doc.id}">
        ${doc.data().name}, ${doc.data().weight}</li>
        `;
      });
      document.getElementById("items-list").innerHTML = items.join("");
    });
  return `
    <h3>E-mail: ${user.email}</h3>
    <ul id="items-list">
    </ul>
    <input type="text" id="new-name" placeholder="nome">
    <input type="number" id="new-weight" placeholder="quantidade">
    <div class="list-buttons">
        <button onclick="onBtnAdd()">Adicionar</button>
        <button onclick="onBtnSelectAll()">Selecionar todos</button>
        <button onclick="onBtnRemove()">Remover</button>
    </div>
    <button onclick="onBtnSignOut()">Sair</button>
`;
}

function onBtnAdd() {
  const db = firebase.firestore();
  const thingsRef = db.collection("things");
  thingsRef.add({
    uid: user.uid,
    name: document.getElementById("new-name").value,
    weight: parseFloat(document.getElementById("new-weight").value),
  });
}

function onBtnSelectAll() {
  const checkboxes = document.getElementsByName("list-item-checkbox");
  const newState = !checkboxes[0].checked;
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = newState;
  }
}

function onBtnRemove() {
  const checkboxes = document.getElementsByName("list-item-checkbox");
  let selectedItems = [];

  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selectedItems.push(checkboxes[i].value);
    }
  }

  for (let i = 0; i < selectedItems.length; i++) {
    firebase.firestore().collection("things").doc(selectedItems[i]).delete();
  }
}
