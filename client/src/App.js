import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewsCard from './components/NewsCard';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [news, setNews] = useState([]);
  const [topic, setTopic] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [searchUsedFirst, setSearchUsedFirst] = useState(false);

  const fetchNews = async (params = {}) => {
    setDateError('');

    const effectiveTopic = params.topic !== undefined ? params.topic : topic;
    const effectiveCountry = params.country !== undefined ? params.country : country;
    const effectiveCategory = params.category !== undefined ? params.category : category;
    const effectiveFrom = params.from !== undefined ? params.from : fromDate;
    const effectiveTo = params.to !== undefined ? params.to : toDate;

    const from = new Date(effectiveFrom);
    const to = new Date(effectiveTo);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    if ((effectiveFrom && isNaN(from)) || (effectiveTo && isNaN(to))) {
      setDateError('Please enter valid dates.');
      return;
    }
    if (effectiveFrom && effectiveTo && from > to) {
      setDateError('From Date cannot be after To Date.');
      return;
    }
    if ((effectiveFrom && from < thirtyDaysAgo) || (effectiveTo && to < thirtyDaysAgo)) {
      setDateError('GNews only supports news from the last 30 days.');
      return;
    }
    if ((effectiveFrom && from > now) || (effectiveTo && to > now)) {
      setDateError('Future dates are not allowed.');
      return;
    }
    // ✅ Only From date without To date → ask user to select To date
    if (effectiveFrom && !effectiveTo) {
      setDateError('Please select a To date as well.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get('https://backendserver-three.vercel.app', {
        params: {
          topic: effectiveTopic || '',
          country: effectiveCountry || '',
          category: effectiveCategory || '',
          from: effectiveFrom || '',
          to: effectiveTo || '',
        }
      });
      setNews(res.data.articles || []);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 429) {
        setDateError('Too many requests. Please wait a minute and try again.');
      }
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBarChange = e => {
    const value = e.target.value;
    setTopic(value);
    setCountry('');
    setCategory('');
    setFromDate('');
    setToDate('');
    setDateError('');
    setSearchUsedFirst(true);
  };

  const handleDropdownChange = (type, value) => {
    if (searchUsedFirst) {
      if (type === 'country') setCountry(value);
      if (type === 'category') setCategory(value);
      fetchNews({
        topic,
        country: type === 'country' ? value : country,
        category: type === 'category' ? value : category,
        from: fromDate,
        to: toDate,
      });
    } else {
      if (type === 'country') setCountry(value);
      if (type === 'category') setCategory(value);
    }
  };

  const handleDateChange = (type, value) => {
    if (type === 'from') setFromDate(value);
    if (type === 'to') setToDate(value);
    if (searchUsedFirst) {
      fetchNews({
        topic,
        country,
        category,
        from: type === 'from' ? value : fromDate,
        to: type === 'to' ? value : toDate,
      });
    }
  };

  const handleSearchClick = () => {
    fetchNews({ topic, country, category, from: fromDate, to: toDate });
  };

  const clearAll = () => {
    setTopic('');
    setCountry('');
    setCategory('');
    setFromDate('');
    setToDate('');
    setSearchUsedFirst(false);
    setDateError('');
    fetchNews();
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const maxDate = new Date().toISOString().split('T')[0];
  const minDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  return (
    <div style={{ background: '#eef1f7', minHeight: '100vh' }}>
      <Container className="py-4">
        <h2 className="text-center" style={{ color: '#0d6efd' }}>
          📰 FlashRead – AI News Digest
        </h2>
        <p className="text-center text-muted fst-italic">Smart. Fast. Focused.</p>

        <div className="bg-white p-3 rounded shadow-sm mb-4">
          <p className="mb-0 text-dark">
            <strong>Welcome to FlashRead – Your AI-Powered News Digest.</strong><br />
            FlashRead helps you stay informed with top headlines from around the world.
            Search by topic, country, or category. Use the date filter to narrow your news.
            Each article includes an AI-generated summary, 3 key takeaways, and sentiment
            analysis — Positive, Neutral, or Negative. Click Read More to view the full article.
            Smart. Fast. Focused.
          </p>
        </div>

        <Alert variant="info" className="mb-2">
          ⏰ GNews only supports news from the <strong>last 30 days</strong>.
        </Alert>
        <Alert variant="warning" className="mb-2">
          📌 GNews free tier returns the <strong>latest 10 articles</strong> per request only.
        </Alert>
        <Alert variant="secondary" className="mb-3">
          📅 <strong>Date filter note:</strong> Due to GNews free tier limitations, when a date
          range is selected, only articles matching the <strong>To date</strong> will be shown.
          Full range filtering requires a paid GNews plan.
        </Alert>

        <Form.Group className="mb-3">
          <Form.Control
            placeholder="Search topic (e.g. AI, elections...)"
            value={topic}
            onChange={handleSearchBarChange}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Select value={country} onChange={e => handleDropdownChange('country', e.target.value)}>
              <option value="">Select Country</option>
              <option value="us">United States</option>
              <option value="in">India</option>
              <option value="gb">United Kingdom</option>
              <option value="au">Australia</option>
              <option value="ca">Canada</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={category} onChange={e => handleDropdownChange('category', e.target.value)}>
              <option value="">Select Category</option>
              <option value="general">General</option>
              <option value="business">Business</option>
              <option value="entertainment">Entertainment</option>
              <option value="health">Health</option>
              <option value="science">Science</option>
              <option value="sports">Sports</option>
              <option value="technology">Technology</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>From Date</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={e => handleDateChange('from', e.target.value)}
              max={maxDate}
              min={minDate}
            />
          </Col>
          <Col md={2}>
            <Form.Label>To Date</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={e => handleDateChange('to', e.target.value)}
              max={maxDate}
              min={minDate}
            />
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button variant="primary" onClick={handleSearchClick} disabled={loading} className="me-2">
              {loading ? 'Loading…' : 'Search'}
            </Button>
            <Button variant="secondary" onClick={clearAll} disabled={loading}>Clear</Button>
          </Col>
        </Row>

        {dateError && <Alert variant="danger">{dateError}</Alert>}

        {loading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Fetching news, please wait...</p>
          </div>
        ) : (
          <Row className="gy-4">
            {news.length ? news.map((a, i) => (
              <Col key={i} md={6} lg={4}>
                <NewsCard {...a} />
              </Col>
            )) : (
              <div className="text-center mt-4">
                <p>No news articles found for the selected filters.</p>
                {(fromDate || toDate) && (
                  <Alert variant="warning" className="mt-2">
                    📅 No articles found for the selected date. GNews free tier only
                    fetches the latest 10 articles — try without a date or add a
                    topic keyword for better results.
                  </Alert>
                )}
              </div>
            )}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default App;
