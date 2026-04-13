

function UserCard({ user, currentUserId, deleteUserId, onDelete }){
  const isSelf = user._id === currentUserId;

  return(
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">

      <div>
        <p className="font-semibold text-gray-800">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase text-gray-700">
            {user.role}
          </span>

          {isSelf && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
              CURRENT ACCOUNT
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(user._id)}
        disabled={isSelf || deleteUserId === user._id}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50  disabled:opacity-50">
        {deleteUserId === user._id ? "Deleting..." : "Delete User"}
      </button>
      
    </div>
  );
}

export default UserCard;
