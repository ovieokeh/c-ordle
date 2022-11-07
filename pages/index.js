import Link from "next/link";
import { useRouter } from "next/router";

export default function Home({ currentUser, rooms, globalRoom }) {
  const router = useRouter();

  const startRoom = async () => {
    const newRoomNameResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/new-room`
    );
    const newRoomName = await newRoomNameResponse.json();
    globalRoom.trigger("client-global-event", {});
    router.push(`/rooms/${newRoomName}`);
  };

  const iterableRooms = Object.entries(rooms).filter(
    ([name]) => name !== "presence-client-global"
  );

  return currentUser && rooms ? (
    <div className="flex flex-col items-center gap-4 max-w-[600px] w-full mx-auto">
      <p>Welcome back {currentUser.username}</p>

      <div className="flex flex-col items-center">
        {iterableRooms.length ? (
          iterableRooms.map(([name, members]) => {
            return (
              <Link
                key={name}
                className="block py-2 px-4 mt-2 rounded hover:bg-slate-600 hover:text-white text-black dark:text-white no-underline"
                type="button"
                href={`/rooms/${name}`}
              >
                Join room {name} ({members.length || 0} player
                {!members.length || members.length > 1 ? "s" : ""})
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center">
            <p>No rooms currently available</p>
          </div>
        )}
        <button
          className="py-2 px-4 mt-2 rounded hover:bg-slate-900 bg-slate-600 text-white"
          onClick={() => startRoom()}
        >
          Start a room
        </button>
      </div>
    </div>
  ) : null;
}
