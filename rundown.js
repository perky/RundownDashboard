fetch('./schedule.json')
    .then((response) => response.json())
    .then((json) => load_schedule(json));

let schedule = undefined;

const rundown_static = {
    minutes_before_warning: -2,
    warning_flash_interval_seconds: 2,
    null_name: 'None',
    null_time: '---',
    clock_format: 'HH:mm:ss',
    json_time_format: 'HH:mm'
};

const timeline = {
    events: undefined,
    time_start: undefined,
    time_end: undefined,
    duration_minutes: undefined
};

function get_time_as_pct(in_time) {
    return (moment.duration(in_time.diff(timeline.time_start)).asMinutes() / timeline.duration_minutes) * 100;
}

function load_schedule(schedule_data) {
    schedule = schedule_data;
    
    // Create event timeline.
    const parse_format = rundown_static.json_time_format;
    const timeline_el = document.getElementById('timeline');
    timeline.time_start = moment(schedule[0].time_start, parse_format);
    timeline.time_end = moment(schedule[schedule.length - 1].time_end, parse_format);
    const total_duration = moment.duration(timeline.time_end.diff(timeline.time_start));
    timeline.duration_minutes = total_duration.asMinutes();
    let i = 0;
    for (const item of schedule) {
        const start = moment(item.time_start, parse_format);
        const end = moment(item.time_end, parse_format);
        const duration = moment.duration(end.diff(start));
        const duration_minutes = duration.asMinutes();
        const duration_pct = (duration_minutes / timeline.duration_minutes) * 100;
        const start_pct = get_time_as_pct(start);

        var block = document.createElement('div');
        timeline_el.prepend(block);
        block.className = 'timeline_block';
        block.style.width = duration_pct + '%';
        block.style.left = start_pct + '%';
        block.innerHTML = `<p>${item.time_start}<br>(${duration_minutes}m)</p><p>${item.name}</p>`;

        if (i % 2 == 0) {
            block.classList.add('even-block');
        } else {
            block.classList.add('odd-block');
        }

        i += 1;
    }

    setInterval(update_display, 1000);
}

function update_display()
{
    const now = moment();
    
    // Update clock.
    const clock_el = document.getElementById('clock');
    clock_el.innerText = now.format(rundown_static.clock_format);
    
    const current_name_el = document.getElementById('current_name');
    const current_time_el = document.getElementById('current_time');
    const current_tminus_el = document.getElementById('current_tminus');
    const nextup_el = document.getElementById('next');
    const nextup_name_el = document.getElementById('next_name');
    const nextup_time_el = document.getElementById('next_time');
    const nextup_tminus_el = document.getElementById('next_tminus');

    // Update timeline playhead.
    const playhead_el = document.getElementById('playhead');
    const playhead_pct = get_time_as_pct(now);
    console.log(playhead_pct);
    playhead_el.style.left = playhead_pct + '%';

    { // Set text fields to defaults.
        current_name_el.innerText = rundown_static.null_name;
        current_time_el.innerText = rundown_static.null_time;
        current_tminus_el.innerText = rundown_static.null_time;
        nextup_name_el.innerText = rundown_static.null_name;
        nextup_time_el.innerText = rundown_static.null_time;
        nextup_tminus_el.innerText = rundown_static.null_time;
    }

    for (const item of schedule) {
        const parse_format = rundown_static.json_time_format;
        const time_start = moment(item.time_start, parse_format);
        const time_end = moment(item.time_end, parse_format);
        const duration_until_start = moment.duration(now.diff(time_start));
        const duration_until_end = moment.duration(now.diff(time_end));

        // Skip events in the past.
        if (duration_until_end.asSeconds() > 0) {
            continue;
        }

        const item_duration = moment.duration(time_end.diff(time_start));
        const item_duration_minutes = Math.round(item_duration.asMinutes());
        const t_minutes_until_start = Math.floor(duration_until_start.asMinutes());
        const t_minutes_until_end = Math.floor(duration_until_end.asMinutes());
        const time_str = `${time_start.format(parse_format)} until ${time_end.format(parse_format)} - (${item_duration_minutes}m)`;
        const t_time_str = `T ${t_minutes_until_start} minutes`;
        
        if (t_minutes_until_start >= 0 && t_minutes_until_end < 0) {
            // Current event.
            current_name_el.innerText = item.name;
            current_time_el.innerText = time_str;
            current_tminus_el.innerText = t_time_str;
        } else if (t_minutes_until_start < 0) {
            // Next up event.
            nextup_name_el.innerText = item.name;
            nextup_time_el.innerText = time_str;
            nextup_tminus_el.innerText = t_time_str;
            // Next up event (warn that it's about to start).
            const sec_until_start = Math.floor(Math.abs(duration_until_start.asSeconds()));
            const b_warn = (sec_until_start % rundown_static.warning_flash_interval_seconds < 1);
            if (t_minutes_until_start >= rundown_static.minutes_before_warning && b_warn) {
                nextup_el.classList.add('time_warn');
            } else {
                nextup_el.classList.remove('time_warn');
            }
            break;
        }
    }
}