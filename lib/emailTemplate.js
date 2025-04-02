export const campaignTemplate = (customerName, campaign) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
        .promo-code { 
            background-color: #f0f9ff; 
            border: 1px dashed #2563eb; 
            padding: 10px; 
            text-align: center; 
            font-size: 18px; 
            margin: 15px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${campaign.campaignName}</h1>
        </div>
        <div class="content">
            <p>Hi ${customerName},</p>
            <p>We're excited to offer you a special discount!</p>
            
            <div class="promo-code">
                Use code <strong>${campaign.promoCode}</strong> for ${campaign.discountPercent}% off!
            </div>
            
            <p>This offer is valid from ${new Date(campaign.startDate).toLocaleDateString()} to ${new Date(campaign.endDate).toLocaleDateString()}.</p>
            <p>Don't miss out on this exclusive offer!</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} eBikri. All rights reserved.</p>
            <p><a href="#" style="color: #2563eb;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
`;