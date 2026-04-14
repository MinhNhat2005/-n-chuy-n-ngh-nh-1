import time

tracked = {}
attendance = set()

def update_tracking(name):
    if name == "Unknown":
        return

    now = time.time()

    if name not in tracked:
        tracked[name] = now
        attendance.add(name)
    elif now - tracked[name] > 10:
        tracked[name] = now
        attendance.add(name)

def get_attendance():
    return list(attendance)