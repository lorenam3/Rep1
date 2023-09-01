function getRandomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}

document.addEventListener("DOMContentLoaded", () => {
  const CHANNEL_ID = "xIvdQ62YDslZhkl9";
  const drone = new ScaleDrone(CHANNEL_ID, {
    data: {
      color: getRandomColor(),
    },
  });

  const DOM = {
    messages: document.querySelector(".chat"),
    input: document.querySelector(".msg-input"),
    form: document.querySelector(".msg-form"),
  };

  let members = [];

  drone.on("open", (error) => {
    if (error) {
      return console.error(error);
    }

    const room = drone.subscribe("observable-room");
    room.on("open", (error) => {
      if (error) {
        return console.error(error);
      }
    });

    room.on("members", (m) => {
      members = m;
      updateMembersDOM();
    });

    room.on("member_join", (member) => {
      members.push(member);
      updateMembersDOM();
    });

    room.on("member_leave", ({ id }) => {
      const index = members.findIndex((member) => member.id === id);
      members.splice(index, 1);
      updateMembersDOM();
    });

    room.on("data", (text, member) => {
      if (member) {
        addMessageToListDOM(text, member);
      }
    });

    DOM.form.addEventListener("submit", sendMessage);

    function sendMessage() {
      const value = DOM.input.value;
      if (value === "") {
        return;
      }
      DOM.input.value = "";
      drone.publish({
        room: "observable-room",
        message: value,
      });
    }

    function createMemberElement(member) {
      const { color } = member.clientData;
      const el = document.createElement("div");
      el.textContent = member.id;
      el.className = "member";
      el.style.color = color;
      return el;
    }

    function createMessageElement(text, member) {
      const { color } = member.clientData;
      const messageElement = document.createElement("div");

      const memberElement = createMemberElement(member);
      const textElement = document.createElement("div");

      textElement.textContent = text;

      messageElement.appendChild(memberElement);
      messageElement.appendChild(textElement);

      messageElement.className = "message";
      return messageElement;
    }

    function addMessageToListDOM(text, member) {
      const el = DOM.messages;

      const message = createMessageElement(text, member);

      if (member.id === drone.clientId) {
        message.classList.add("sent");
      } else {
        message.classList.add("received");
      }
      el.appendChild(message);
    }
  });
});
