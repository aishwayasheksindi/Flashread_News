// client/src/App.js
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
  const [infoMessage, setInfoMessage] = useState('');
  const [searchUsedFirst, setSearchUsedFirst] = useState(false);

  const fetchNews = async (params = {}) => {
    setDateError('');
    setInfoMessage('');

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

    if (!effectiveTopic && (effectiveFrom || effectiveTo)) {
      if (!effectiveCountry && !effectiveCategory) {
        setInfoMessage('Please select a country or category (or both) to filter news by date.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.get('/api/news', {
        params: {
          topic: effectiveTopic || '',
          country: effectiveCountry || '',
          category: effectiveCategory || '',
          from: effectiveFrom || '',
          to: effectiveTo || ''
        }
      });
      setNews(res.data.articles || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBarChange = e => {
    const value = e.target.value;
    setTopic(value);
    // clear previous filters when search bar is used after filters
    setCountry('');
    setCategory('');
    setFromDate('');
    setToDate('');
    setDateError('');
    setInfoMessage('');
    setSearchUsedFirst(true);
  };

  const handleDropdownChange = (type, value) => {
    if (searchUsedFirst) {
      // user started with search bar; apply filters on top
      if (type === 'country') setCountry(value);
      if (type === 'category') setCategory(value);
      fetchNews({
        topic,
        country: type === 'country' ? value : country,
        category: type === 'category' ? value : category,
        from: fromDate,
        to: toDate
      });
    } else {
      // filters-first path
      if (type === 'country') setCountry(value);
      if (type === 'category') setCategory(value);
    }
  };

  const handleDateChange = (type, value) => {
    if (searchUsedFirst) {
      const newFrom = type === 'from' ? value : fromDate;
      const newTo = type === 'to' ? value : toDate;
      setFromDate(newFrom);
      setToDate(newTo);
      fetchNews({
        topic,
        country,
        category,
        from: newFrom,
        to: newTo
      });
    } else {
      if (type === 'from') setFromDate(value);
      if (type === 'to') setToDate(value);
    }
  };

  const handleSearchClick = () => {
    fetchNews({
      topic,
      country,
      category,
      from: fromDate,
      to: toDate
    });
  };

  const clearAll = () => {
    setTopic('');
    setCountry('');
    setCategory('');
    setFromDate('');
    setToDate('');
    setSearchUsedFirst(false);
    setDateError('');
    setInfoMessage('');
    fetchNews(); // default fetch
  };

  useEffect(() => {
    fetchNews(); // initial load
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
            FlashRead helps you stay informed with top headlines from selected countries. You can choose a country, category, or enter a custom topic (like “AI” or “Elections in India”) using the search bar. Optional From/To Date filters help narrow your news. Each article comes with an AI-generated summary, 3 key points, and sentiment analysis (Positive, Neutral, or Negative) to help you absorb information quickly. Click Read More to view the full article. It's smart, fast, and focused — just like you!
          </p>
        </div>

        <Alert variant="info" className="mb-2">
          ⏰ You can only fetch news from the <strong>last 30 days</strong>. Please choose dates accordingly.
        </Alert>
        <Alert variant="warning" className="mb-3">
          📌 Note: GNews returns only the <strong>latest 20 results</strong>. Older articles within your date range may be skipped.
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
        {infoMessage && <Alert variant="warning">{infoMessage}</Alert>}

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
              <p className="text-center mt-4">No news articles available.</p>
            )}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default App;
