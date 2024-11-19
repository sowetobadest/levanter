const {
  bot,
  parsedJid,
  validateTime,
  createSchedule,
  delScheduleMessage,
  deleteScheduleTask,
  getScheduleMessage,
} = require('../lib/')

bot(
  {
    pattern: 'setschedule ?(.*)',
    desc: 'To set Schedule Message',
    type: 'schedule',
  },
  async (message, match) => {
    if (!message.reply_message)
      return await message.send('*Reply to a Message, which is scheduled to send*')
    const [jid, time, once] = match.split(',')
    const [isJid] = parsedJid(jid)
    const isTimeValid = validateTime(time)
    if (!isJid || !isTimeValid)
      return await message.send(
        '> *Example :*\n- setschedule jid,min-hour-day-month (in 24 hour format, day and month optional)\n- setschedule 91987654321@s.whatsapp.net, 9-9-13-8\n- setschedule 91987654321@s.whatsapp.net, 0-10 (send message daily at 10 am)\n- setschedule 91987654321@s.whatsapp.net, 0-10, once (send message at 10 am, one time)'
      )
    const at = await createSchedule(isJid, isTimeValid, message, message.jid, once, message.id)
    await message.send(`_successfully scheduled to send at ${at}_`)
  }
)

bot(
  {
    pattern: 'getschedule ?(.*)',
    desc: 'To get all Schedule Message',
    type: 'schedule',
  },
  async (message, match) => {
    const [jid] = parsedJid(match)
    const schedules = await getScheduleMessage(jid, message.id)
    if (schedules.length < 1) return await message.send('_There is no any schedules_')
    let msg = ''
    for (const schedule of schedules) {
      msg += `Jid : ${schedule.jid}\nTime : ${schedule.time}\n\n`
    }
    return await message.send(msg.trim())
  }
)

bot(
  {
    pattern: 'delschedule ?(.*)',
    desc: 'To delete Schedule Message',
    type: 'schedule',
  },
  async (message, match) => {
    if (!match)
      return await message.send(
        '> *Example :*\n- delschedule 9198765431@s.whatsapp.net, 8-8-10-10\n- delschedule 9198765431@s.whatsapp.net\n- delschedule all'
      )
    const [jid, time] = match.split(',')
    let [isJid] = parsedJid(jid)
    const isTimeValid = validateTime(time)
    if (!isJid && match !== 'all')
      return await message.send('> *Example :*\n- delschedule 9198765431@s.whatsapp.net, 8-8-10-10')
    if (!isJid) isJid = match
    const isDeleted = await delScheduleMessage(isJid, isTimeValid, message.id)
    if (!isDeleted) return await message.send('_Schedule not found!_')
    deleteScheduleTask(isJid, isTimeValid, message.id)
    return await message.send('_Schedule deleted_')
  }
)
