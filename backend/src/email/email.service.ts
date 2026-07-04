import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{
    name: string;
    size?: string;
    color?: string;
    price: number;
    quantity: number;
    total: number;
    imageUrl?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail = 'Ayaan Fashion <orders@ayaanfashion.com>';

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_FLWgpN4i_4ySwDAZG1P4gVFQ3h1LuqA4F');
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    try {
      const html = this.generateOrderConfirmationHtml(data);

      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.customerEmail,
        subject: `Order Confirmed! #${data.orderNumber} - Ayaan Fashion`,
        html,
      });

      this.logger.log(`Order confirmation email sent to ${data.customerEmail} for order ${data.orderNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email: ${error.message}`);
      return false;
    }
  }

  private generateOrderConfirmationHtml(data: OrderEmailData): string {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center;">
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">` : ''}
            <div>
              <p style="margin: 0; font-weight: 600; color: #333;">${item.name}</p>
              ${item.size ? `<p style="margin: 2px 0 0; font-size: 13px; color: #666;">Size: ${item.size}</p>` : ''}
              ${item.color ? `<p style="margin: 2px 0 0; font-size: 13px; color: #666;">Color: ${item.color}</p>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">₹${Number(item.total).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #c4712a 0%, #a35a25 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Ayaan Fashion</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Premium Footwear & Watches</p>
        </div>

        <!-- Success Banner -->
        <div style="background-color: #22c55e; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px;">✓ Order Confirmed!</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Thank you for your purchase</p>
        </div>

        <div style="padding: 30px;">
          <!-- Order Info -->
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
              <div style="margin-bottom: 12px;">
                <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #c4712a;">${data.orderNumber}</p>
              </div>
              <div style="margin-bottom: 12px;">
                <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Payment Method</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #333; text-transform: uppercase;">${data.paymentMethod === 'cod' ? 'Cash on Delivery' : data.paymentMethod === 'upi' ? 'UPI Payment' : data.paymentMethod === 'card' ? 'Credit/Debit Card' : data.paymentMethod}</p>
              </div>
            </div>
          </div>

          <!-- Customer Info -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; color: #333; margin: 0 0 12px; border-bottom: 2px solid #c4712a; padding-bottom: 8px; display: inline-block;">Shipping Details</h3>
            <p style="margin: 0; color: #555; line-height: 1.6;">
              <strong>${data.customerName}</strong><br>
              ${data.shippingAddress}<br>
              ${data.city}, ${data.state} - ${data.pincode}<br>
              Phone: ${data.customerPhone}
            </p>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; color: #333; margin: 0 0 12px; border-bottom: 2px solid #c4712a; padding-bottom: 8px; display: inline-block;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px 0; text-align: left; font-size: 12px; color: #888; text-transform: uppercase;">Item</th>
                  <th style="padding: 10px 0; text-align: center; font-size: 12px; color: #888; text-transform: uppercase;">Qty</th>
                  <th style="padding: 10px 0; text-align: right; font-size: 12px; color: #888; text-transform: uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Order Summary -->
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 16px; color: #333; margin: 0 0 16px;">Order Summary</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Subtotal</span>
              <span style="font-weight: 600;">₹${Number(data.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Shipping</span>
              <span style="font-weight: 600;">${Number(data.shippingCost) === 0 ? 'FREE' : '₹' + Number(data.shippingCost).toLocaleString('en-IN')}</span>
            </div>
            ${Number(data.tax) > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Tax</span>
              <span style="font-weight: 600;">₹${Number(data.tax).toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            ${Number(data.discount) > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #22c55e;">
              <span>Discount</span>
              <span style="font-weight: 600;">-₹${Number(data.discount).toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            <div style="border-top: 2px solid #c4712a; margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between;">
              <span style="font-size: 18px; font-weight: 700; color: #333;">Total</span>
              <span style="font-size: 20px; font-weight: 700; color: #c4712a;">₹${Number(data.total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          ${data.notes ? `
          <div style="background-color: #fff3cd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Note:</strong> ${data.notes}</p>
          </div>
          ` : ''}

          <!-- What's Next -->
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 16px; color: #333; margin: 0 0 16px;">What Happens Next?</h3>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <div style="background-color: #c4712a; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</div>
              <p style="margin: 0; color: #555;">Our team will verify and confirm your order shortly.</p>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <div style="background-color: #c4712a; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</div>
              <p style="margin: 0; color: #555;">Your order will be packed with care.</p>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <div style="background-color: #c4712a; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</div>
              <p style="margin: 0; color: #555;">You'll receive tracking details once shipped.</p>
            </div>
            <div style="display: flex; align-items: flex-start;">
              <div style="background-color: #c4712a; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">4</div>
              <p style="margin: 0; color: #555;">Track your order anytime using order number <strong>${data.orderNumber}</strong></p>
            </div>
          </div>

          <!-- Support -->
          <div style="text-align: center; padding: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Need help? Contact us</p>
            <p style="margin: 0; color: #333;">
              <a href="mailto:bhojanikomail@gmail.com" style="color: #c4712a; text-decoration: none;">bhojanikomail@gmail.com</a> |
              <a href="tel:+917977885020" style="color: #c4712a; text-decoration: none;">+91-7977885020</a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Ayaan Fashion. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
