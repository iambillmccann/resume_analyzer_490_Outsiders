import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import axios from 'axios';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders spinner component', () => {
  render(<Spinner />);
  const spinnerElement = screen.getByTestId('spinner');
  expect(spinnerElement).toBeInTheDocument();
});

test('displays loading spinner during API call', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Load Data/i));
  expect(screen.getByTestId('spinner')).toBeInTheDocument();
});

test('displays error message on API failure', async () => {
  // Mock API failure
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));

  render(<App />);
  fireEvent.click(screen.getByText(/Load Data/i));

  const errorElement = await screen.findByText(/Failed to fetch data/i);
  expect(errorElement).toBeInTheDocument();

  global.fetch.mockRestore();
});



jest.mock('axios'); // Mock axios for API requests

describe('RegistrationForm', () => {
  it('should render the registration form', () => {
    render(<RegistrationForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('should validate email and password fields', async () => {
    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@domain.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'short' } }); // Short password for validation
    fireEvent.click(screen.getByText(/sign up/i));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('should submit form correctly', async () => {
    axios.post.mockResolvedValue({ data: { message: 'User registered' } });

    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@domain.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securePassword' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user123' } });

    fireEvent.click(screen.getByText(/sign up/i));

    expect(axios.post).toHaveBeenCalledWith('/api/register', {
      email: 'user@domain.com',
      password: 'securePassword',
      username: 'user123',
    });
    expect(await screen.findByText(/User registered/)).toBeInTheDocument();
  });
});

describe('ResumeUpload', () => {
  it('should render the upload form', () => {
    render(<ResumeUpload />);
    expect(screen.getByLabelText(/upload resume/i)).toBeInTheDocument();
  });

  it('should show an error message for non-PDF files', async () => {
    render(<ResumeUpload />);

    const fileInput = screen.getByLabelText(/upload resume/i);
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(await screen.findByText(/Invalid file type. Only PDF files are allowed/)).toBeInTheDocument();
  });

  it('should submit the file correctly', async () => {
    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    axios.post.mockResolvedValue({ data: { message: 'Resume uploaded successfully' } });

    render(<ResumeUpload />);

    const fileInput = screen.getByLabelText(/upload resume/i);
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/resume-upload', expect.any(FormData)));
    expect(await screen.findByText(/Resume uploaded successfully/)).toBeInTheDocument();
  });
});