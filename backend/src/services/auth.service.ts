import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(phone: string, otp: string): Promise<void> {
  // In production: use Twilio
  // For demo/dev: just log it
  console.log(`📱 OTP for ${phone}: ${otp}`);

  const isDemoMode = process.env.DEMO_MODE === 'true';
  if (!isDemoMode && process.env.TWILIO_ACCOUNT_SID) {
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilio.messages.create({
      body: `Your AutoUPI OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  }
}

export async function requestOTP(phone: string, email: string) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single();

  const otp = process.env.DEMO_MODE === 'true' ? '123456' : generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Delete old OTPs
  await supabase.from('otp_records').delete().eq('phone', phone);

  // Store new OTP
  await supabase.from('otp_records').insert({
    id: uuidv4(),
    phone,
    email,
    otp,
    expires_at: expiresAt,
    used: false,
  });

  await sendOTP(phone, otp);

  return {
    isNewUser: !existingUser,
    message: process.env.DEMO_MODE === 'true' ? 'Demo OTP: 123456' : 'OTP sent successfully',
  };
}

export async function verifyOTPAndLogin(phone: string, email: string, fullName: string, otp: string) {
  // Verify OTP
  const { data: otpRecord } = await supabase
    .from('otp_records')
    .select('*')
    .eq('phone', phone)
    .eq('used', false)
    .single();

  if (!otpRecord) throw new Error('OTP not found or already used');
  if (new Date(otpRecord.expires_at) < new Date()) throw new Error('OTP expired');
  if (otpRecord.otp !== otp) throw new Error('Invalid OTP');

  // Mark OTP as used
  await supabase.from('otp_records').update({ used: true }).eq('id', otpRecord.id);

  // Find or create user
  let user;
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (existingUser) {
    user = existingUser;
    // Update email if provided
    if (email && email !== existingUser.email) {
      await supabase.from('users').update({ email }).eq('id', existingUser.id);
      user.email = email;
    }
  } else {
    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: uuidv4(),
        phone,
        email: email || `${phone}@autoupi.demo`,
        full_name: fullName || 'AutoUPI User',
        role: 'USER',
        kyc_status: 'VERIFIED',
        wallet_balance: 50000, // Demo starter balance
      })
      .select()
      .single();

    if (error) throw error;
    user = newUser;
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );

  return { token, user };
}

export async function getUserById(id: string) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
