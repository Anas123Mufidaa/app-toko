import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Divider, Image, Input, Link } from '@heroui/react';
import { Icon } from '@iconify/react';
import { login } from '@/service/api-service.js';
import { setAuthSession } from '@/service/auth-storage.js';

function MailIcon(props) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M17 3.5H7C4 3.5 2 5 2 8.5V15.5C2 19 4 20.5 7 20.5H17C20 20.5 22 19 22 15.5V8.5C22 5 20 3.5 17 3.5ZM17.47 9.59L14.34 12.09C13.68 12.62 12.84 12.88 12 12.88C11.16 12.88 10.31 12.62 9.66 12.09L6.53 9.59C6.21 9.33 6.16 8.85 6.41 8.53C6.67 8.21 7.14 8.15 7.46 8.41L10.59 10.91C11.35 11.52 12.64 11.52 13.4 10.91L16.53 8.41C16.85 8.15 17.33 8.2 17.58 8.53C17.84 8.85 17.79 9.33 17.47 9.59Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login({ username, password });
      setAuthSession({
        token: result.token,
        username: result.username ?? username,
      });
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError?.message || 'Login gagal. Periksa kembali username/password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-primary-300">
      <div className="flex min-h-screen items-center justify-center p-6 md:p-8">
        <Card className="w-full max-w-sm shadow-large py-10 px-5">
          <CardHeader className="flex flex-col items-center gap-1">
            <h1 className="text-md font-semibold">Welcome back</h1>
            <p className="text-xs text-default-500">Login to your App Toko account</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <Input
                endContent={<MailIcon className="pointer-events-none shrink-0 text-2xl text-default-400" />}
                isRequired
                name="username"
                type="text"
                label="Username"
                placeholder="Enter your username"
                variant="bordered"
                value={username}
                onValueChange={setUsername}
              />
              <Input
                isRequired
                endContent={(
                  <button type="button" onClick={() => setIsVisible((prev) => !prev)}>
                    {isVisible ? (
                      <Icon
                        className="pointer-events-none text-2xl text-default-400"
                        icon="solar:eye-closed-linear"
                      />
                    ) : (
                      <Icon
                        className="pointer-events-none text-2xl text-default-400"
                        icon="solar:eye-bold"
                      />
                    )}
                  </button>
                )}
                name="password"
                type={isVisible ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                variant="bordered"
                value={password}
                onValueChange={setPassword}
              />

              {error ? (
                <div className="rounded-md border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                  {error}
                </div>
              ) : null}

              <Button className="w-full bg-primary-600 text-white font-semibold" type="submit" isLoading={isSubmitting}>
                Sign In
              </Button>

              <p className="text-center text-xs text-default-500">Copyright by Anas Mufida</p>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
