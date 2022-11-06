import Pusher from "pusher-js";

Pusher.logToConsole = true;

const initialiseApp = (userId, username) => {
  const APP_KEY = "ff55c31ec5e3af20d0bf";

  return new Pusher(APP_KEY, {
    cluster: "eu",
    channelAuthorization: {
      endpoint: `${process.env.NEXT_PUBLIC_SERVER_URL}/pusher/join-lobby`,
      params: { userId, username },
    },
  });
};

export { initialiseApp };
