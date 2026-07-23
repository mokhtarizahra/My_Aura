import { describe, it, expect } from 'vitest';
import { generateOTP } from './generateOTP.js';

describe('Utility:generateOTP', () => {
	it('it must return astring that is exactly 4 digits long and consists solely of numbers', () => {
		//Act
		const otp  = generateOTP ();

		//Assert
		expect(otp).toHaveLength(4);
		expect(typeof otp).toBe('string');
		expect(/^\d{4}$/.test(otp)).toBe(true);
	});
});