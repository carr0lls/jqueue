const addZero = i => {
  if (i < 10) {
      i = "0" + i
  }
  return i
}

export const getTimeString = () => {
  let d = new Date()
  let h = addZero(d.getHours())
  let m = addZero(d.getMinutes())
  let s = addZero(d.getSeconds())
  return d.toDateString() + " " + h + ":" + m + ":" + s
}
