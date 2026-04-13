import { API_BASE_URL } from "../services/api";

function VisitorCard({
  visitor,
  canManageVisitors,
  canIssuePass,
  openScheduleId,
  visitDate,
  visitTime,
  issueLoadingId,
  setVisitDate,
  setVisitTime,
  onApprove,
  onReject,
  onOpenSchedule,
  onCloseSchedule,
  onSaveSchedule,
  onIssuePass,
}){
  function getPhotoUrl(photo){
    if(!photo){
      return "";
    }

    return API_BASE_URL.replace("/api", "") + "/uploads/photos/" + encodeURIComponent(photo);
  }

  function getCheckText(value){
    if(value === "checked-in"){
      return "Checked In";
    }

    if(value === "checked-out"){
      return "Checked Out";
    }
    return "Not Visited";
  }

  function getCheckColor(value){
    if(value === "checked-in"){
      return "bg-green-100 text-green-700";
    }

    if(value === "checked-out"){
      return "bg-orange-100 text-orange-700";
    }
    return "bg-gray-100 text-gray-600";
  }

  function showDate(value){
    if(!value){
      return "";
    }

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const photoUrl = getPhotoUrl(visitor.photo);
  const showScheduleBox = openScheduleId === visitor._id && canManageVisitors;

  return(
    <div className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-4">
        
        <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={visitor.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.target.style.display = "none";
              }}
            />
          ):(
            <div className="flex h-full items-center justify-center text-center text-sm text-gray-400"> No Photo</div>
          )}
        </div>

        <div className="min-w-0">

          <h3 className="text-lg font-bold text-gray-800">{visitor.name}</h3>
          <p className="text-sm text-gray-500">{visitor.email}</p>
          <p className="text-sm text-gray-500">{visitor.purpose || "General Visit"}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase 
                ${
                visitor.status === "approved" ? "bg-green-100 text-green-700" :
                visitor.status === "rejected"  ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700" }`}>
                  {visitor.status}
            </span>

            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase 
                ${ visitor.isScheduled ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600" }`}>
                {visitor.isScheduled ? "scheduled" : "not scheduled"}
            </span>

            {visitor.passIssued && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase text-blue-700">
                pass issued
              </span>
            )}

            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${getCheckColor(
                visitor.checkStatus
              )}`}>
              {getCheckText(visitor.checkStatus)}
            </span>

          </div>

          {visitor.isScheduled && (
            <p className="mt-3 text-sm text-gray-500">
              Date: {visitor.visitDate} | Time: {visitor.visitTime}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Entry Status: <span className="font-medium text-gray-700">{getCheckText(visitor.checkStatus)}</span>
          </p>

          {visitor.checkStatus === "checked-in" && visitor.lastCheckIn && (
            <p className="mt-2 text-sm font-medium text-green-700">Checked in at {showDate(visitor.lastCheckIn)}</p>
          )}

          {visitor.checkStatus === "checked-out" && (
            <div className="mt-2 space-y-1 text-sm">
              {visitor.lastCheckIn && <p className="text-gray-500">Checked in: {showDate(visitor.lastCheckIn)}</p>}
              {visitor.lastCheckOut && (
                <p className="font-medium text-orange-700">Checked out: {showDate(visitor.lastCheckOut)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:items-end">
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {visitor.status === "pending" && canManageVisitors && (
            <>
              <button className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white transition hover:bg-green-600"
                onClick={() => onApprove(visitor._id)} >
                Approve
              </button>

              <button className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
                onClick={() => onReject(visitor._id)}>
                Reject
              </button>
            </>
          )}

          {visitor.status === "approved" && !visitor.isScheduled && canManageVisitors && (
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
              onClick={() => onOpenSchedule(visitor._id)} >
              Schedule Appointment
            </button>
          )}

          {visitor.status === "approved" && visitor.isScheduled && !visitor.passIssued && canIssuePass && (
            <button className="rounded-lg bg-yellow-500 px-4 py-2 text-sm text-white transition hover:bg-yellow-600  disabled:bg-yellow-300"
              onClick={() => onIssuePass(visitor._id)}
              disabled={issueLoadingId === visitor._id} 
            >
              {issueLoadingId === visitor._id ? "Issuing..." : "Issue Pass"}
            </button>
          )}
        </div>

        {showScheduleBox && (
          <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 lg:w-72">
            <div className="flex flex-col gap-2">
              <input
                type="date"
                className="rounded-lg border border-gray-200 bg-white p-2 outline-none focus:border-blue-400"
                value={visitDate}
                onChange={(event) => setVisitDate(event.target.value)}
              />

              <input
                type="time"
                className="rounded-lg border border-gray-200 bg-white p-2 outline-none focus:border-blue-400"
                value={visitTime}
                onChange={(event) => setVisitTime(event.target.value)}
              />
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => onSaveSchedule(visitor._id)}
                className="mt-3 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition hover:bg-green-700">
                Save
              </button>

              <button
                onClick={onCloseSchedule}
                className="mt-3 rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-300">
                Cancel
              </button>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisitorCard;
