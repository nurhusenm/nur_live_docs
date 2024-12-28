import CollaborativeRoom from "@/components/CollaborativeRoom"
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

// const Document = async ({ params: { id } }: SearchParamProps) => {
//   // const { id } = await params; 
//   const clerkUser = await currentUser();
//   if(!clerkUser) redirect('/sign-in');
const Document = async ({ params }: SearchParamProps) => {
  const { id } = await params; // Await params before destructuring
  const clerkUser  = await currentUser();

  if (!clerkUser ) {
    redirect('/sign-in');
    // return; // Ensure to return after redirecting
  }
  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if(!room) redirect('/');

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  
  const userEmail = users?.email; // Safely access user email
  const userAccess = room.usersAccesses[userEmail]; // Access usersAccesses safely
  const usersData = users.map((user: User) => ({
    
    ...user,
    userType: userAccess && userAccess.includes('room:write') // Check if userAccess is defined
      ? 'editor'
      : 'viewer'
  }))

  const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  )
}

export default Document