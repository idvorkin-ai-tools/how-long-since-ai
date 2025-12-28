import { useMemo, useState, useEffect } from 'react';
import { calculateTimeSince } from './utils';
import './App.css';

interface AIEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  category: 'model' | 'tool' | 'art';
}

function formatTimeSince(dateStr: string): string {
  const ts = calculateTimeSince(new Date(dateStr));
  const parts: string[] = [];
  if (ts.years > 0) parts.push(`${ts.years}y`);
  if (ts.months > 0) parts.push(`${ts.months}m`);
  if (parts.length === 0) parts.push('<1m');
  return parts.join(' ');
}

const sectionConfig = {
  model: { title: 'Models', color: '#00d9a0' },
  tool: { title: 'Programming', color: '#a855f7' },
  art: { title: 'Art', color: '#f472b6' },
};

type Category = 'model' | 'tool' | 'art';

function getInitialState(): Record<Category, boolean> {
  const params = new URLSearchParams(window.location.search);
  const show = params.get('show');

  if (show) {
    const enabled = show.split(',') as Category[];
    return {
      model: enabled.includes('model'),
      tool: enabled.includes('tool'),
      art: enabled.includes('art'),
    };
  }

  return { model: true, tool: true, art: true };
}

function App() {
  const [events, setEvents] = useState<AIEvent[]>([]);
  const [enabled, setEnabled] = useState<Record<Category, boolean>>(getInitialState);

  useEffect(() => {
    fetch('/events.json')
      .then((res) => res.json())
      .then((data) => setEvents(data.events));
  }, []);

  useEffect(() => {
    const enabledCategories = (Object.keys(enabled) as Category[]).filter((k) => enabled[k]);
    const params = new URLSearchParams();

    if (enabledCategories.length < 3) {
      params.set('show', enabledCategories.join(','));
      window.history.replaceState({}, '', `?${params.toString()}`);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [enabled]);

  const toggle = (category: Category) => {
    setEnabled((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const groupedEvents = useMemo(() => {
    const groups = {
      model: events.filter((e) => e.category === 'model'),
      tool: events.filter((e) => e.category === 'tool'),
      art: events.filter((e) => e.category === 'art'),
    };
    Object.values(groups).forEach((group) =>
      group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    return groups;
  }, [events]);

  const categories: Category[] = ['model', 'tool', 'art'];

  return (
    <div className="app">
      <header className="header">
        <h1>How Long Since AI?</h1>
        <p className="tagline">
          It's easy to forget how fast this is moving.<br />
          Look how little time it's been since...
        </p>
      </header>

      <div className="filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${enabled[cat] ? 'active' : ''}`}
            style={{ '--btn-color': sectionConfig[cat].color } as React.CSSProperties}
            onClick={() => toggle(cat)}
          >
            {sectionConfig[cat].title}
          </button>
        ))}
      </div>

      {categories.map((category) =>
        enabled[category] ? (
          <section key={category} className="section">
            <h2 style={{ color: sectionConfig[category].color }}>
              {sectionConfig[category].title}
            </h2>
            <ul className="event-list">
              {groupedEvents[category].map((event) => (
                <li key={event.id} className="event-item">
                  <span className="event-name">{event.name}</span>
                  <span className="event-desc">{event.description}</span>
                  <span className="event-time" style={{ color: sectionConfig[category].color }}>
                    {formatTimeSince(event.date)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null
      )}

      <footer className="footer">
        <p className="perspective">
          What's the ceiling? Maybe we're already there. Maybe not.<br />
          Either way, it's like we just invented electricity—<br />
          foundational, transformative, and with so much left to build.
        </p>
      </footer>
    </div>
  );
}

export default App;
