// components/auth/PhoneForm.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

import { PhoneForm } from './PhoneForm';
import { usePhone } from '@/hooks/usePhone';
import { AuthProvider } from '@/context/AuthContext';

// Mocks
vi.mock('@/hooks/usePhone', () => ({
  usePhone: vi.fn(),
}));


vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Helpers
const renderWithAuth = (
  ui: React.ReactNode
) =>
  render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );

// Test Suite
describe('PhoneForm', () => {

  const mockRequestOTP = vi.fn();


  beforeEach(() => {
    vi.clearAllMocks();

    (usePhone as any).mockReturnValue({
      requestOTP: mockRequestOTP,
    });
  });

  // Rendering
  describe('Rendering', () => {

    it('renders all required elements', () => {

      renderWithAuth(
        <PhoneForm />
      );


      expect(
        screen.getByText('ورود به حساب کاربری')
      )
      .toBeInTheDocument();


      expect(
        screen.getByLabelText('شماره موبایل')
      )
      .toBeInTheDocument();


      expect(
        screen.getByPlaceholderText('09123456789')
      )
      .toBeInTheDocument();


      expect(
        screen.getByRole(
          'button',
          {
            name:/ارسال کد تأیید/i
          }
        )
      )
      .toBeInTheDocument();


      expect(
        screen.getByRole('link',{
          name:'وارد شوید'
        })
      )
      .toHaveAttribute(
        'href',
        '/auth/login'
      );
    });



    it('has correct input attributes',()=>{

      renderWithAuth(
        <PhoneForm/>
      );


      const input =
        screen.getByLabelText(
          'شماره موبایل'
        );


      expect(input)
        .toHaveAttribute(
          'type',
          'tel'
        );


      expect(input)
        .toHaveAttribute(
          'inputmode',
          'numeric'
        );


      expect(input)
        .toHaveAttribute(
          'autocomplete',
          'tel'
        );

    });

  });

  // Validation
  describe('Validation',()=>{


    it('shows error when phone is empty',async()=>{

      const user =
        userEvent.setup();


      renderWithAuth(
        <PhoneForm/>
      );


      await user.click(
        screen.getByRole(
          'button',
          {
            name:/ارسال کد تأیید/i
          }
        )
      );


      expect(
        await screen.findByText(
          'شماره موبایل الزامی است'
        )
      )
      .toBeInTheDocument();

    });



    it('shows error for invalid phone format',async()=>{


      const user =
        userEvent.setup();


      renderWithAuth(
        <PhoneForm/>
      );


      await user.type(
        screen.getByLabelText(
          'شماره موبایل'
        ),
        '091234567'
      );


      await user.click(
        screen.getByRole(
          'button',
          {
            name:/ارسال کد تأیید/i
          }
        )
      );


      expect(
        await screen.findByText(
          'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'
        )
      )
      .toBeInTheDocument();

    });


  });

  // Submit success
  describe('Submit',()=>{


    it('calls requestOTP with valid phone',async()=>{

      const user =
        userEvent.setup();


      mockRequestOTP.mockResolvedValue({
        success:true
      });


      renderWithAuth(
        <PhoneForm/>
      );


      await user.type(
        screen.getByLabelText(
          'شماره موبایل'
        ),
        '09123456789'
      );


      await user.click(
        screen.getByRole(
          'button',
          {
            name:/ارسال کد تأیید/i
          }
        )
      );


      await waitFor(()=>{

        expect(
          mockRequestOTP
        )
        .toHaveBeenCalledWith(
          '09123456789'
        );

      });


    });


  });

  // Error handling
  describe('Request errors',()=>{


    it('shows server error message',async()=>{


      const user =
        userEvent.setup();


      mockRequestOTP.mockResolvedValue({

        success:false,

        error:
          'خطا در ارسال کد'

      });



      renderWithAuth(
        <PhoneForm/>
      );


      await user.type(
        screen.getByLabelText(
          'شماره موبایل'
        ),
        '09123456789'
      );


      await user.click(
        screen.getByRole(
          'button',
          {
            name:/ارسال کد تأیید/i
          }
        )
      );



      expect(
        await screen.findByText(
          'خطا در ارسال کد'
        )
      )
      .toBeInTheDocument();


    });



    it('clears phone input after failed request',async()=>{


      const user =
        userEvent.setup();


      mockRequestOTP.mockResolvedValue({

        success:false,

        error:'error'

      });



      renderWithAuth(
        <PhoneForm/>
      );


      const input =
        screen.getByLabelText(
          'شماره موبایل'
        );


      await user.type(
        input,
        '09123456789'
      );


      await user.click(
        screen.getByRole(
          'button',
          {
            name:/ارسال کد تأیید/i
          }
        )
      );


      await waitFor(()=>{

        expect(input)
        .toHaveValue('');

      });


    });


  });

  // Loading state
  describe('Loading state',()=>{


    it('disables controls while submitting',async()=>{


      const user =
        userEvent.setup();


      mockRequestOTP.mockImplementation(
        () =>
          new Promise(()=>{})
      );


      renderWithAuth(
        <PhoneForm/>
      );


      const input =
        screen.getByLabelText(
          'شماره موبایل'
        );


      const button =
        screen.getByRole(
          'button',
          {
            name:/ارسال کد تأیید/i
          }
        );


      await user.type(
        input,
        '09123456789'
      );


      await user.click(
        button
      );


      await waitFor(()=>{

        expect(input)
          .toBeDisabled();


        expect(button)
          .toBeDisabled();

      });


    });



    it('does not submit twice while request is pending',async()=>{


      const user =
        userEvent.setup();


      mockRequestOTP.mockImplementation(
        () =>
          new Promise(()=>{})
      );


      renderWithAuth(
        <PhoneForm/>
      );


      await user.type(
        screen.getByLabelText(
          'شماره موبایل'
        ),
        '09123456789'
      );


      const button =
        screen.getByRole(
          'button',
          {
            name:/ارسال کد تأیید/i
          }
        );


      await user.click(button);

      await user.click(button);



      expect(
        mockRequestOTP
      )
      .toHaveBeenCalledTimes(1);


    });


  });

  // Accessibility
  describe('Accessibility',()=>{


    it('sets aria-invalid when validation fails',async()=>{


      const user =
        userEvent.setup();


      renderWithAuth(
        <PhoneForm/>
      );


      const input =
        screen.getByLabelText(
          'شماره موبایل'
        );


      await user.click(screen.getByRole('button',{name:/ارسال کد تأیید/i}));

      await waitFor(()=>{

        expect(input)
        .toHaveAttribute(
          'aria-invalid',
          'true'
        );

      });


    });


  });


});