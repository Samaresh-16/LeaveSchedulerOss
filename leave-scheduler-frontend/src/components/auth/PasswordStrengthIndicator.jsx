// src/components/auth/PasswordStrengthIndicator.jsx
import React from "react";

/**
 * A simple password strength indicator component
 *
 * @param {Object} props
 * @param {string} props.password - The password to check
 * @returns {JSX.Element} Password strength indicator
 */
const PasswordStrengthIndicator = ({ password }) => {
	// Simple password strength algorithm
	const getStrength = (password) => {
		if (!password) return 0;

		let score = 0;

		// Length check
		if (password.length > 6) score += 1;
		if (password.length > 10) score += 1;

		// Character variety check
		if (/[A-Z]/.test(password)) score += 1;
		if (/[0-9]/.test(password)) score += 1;
		if (/[^A-Za-z0-9]/.test(password)) score += 1;

		return Math.min(score, 4);
	};

	const strength = getStrength(password);

	// Determine label and colors based on strength
	const getLabel = () => {
		switch (strength) {
			case 0:
				return "Very Weak";
			case 1:
				return "Weak";
			case 2:
				return "Fair";
			case 3:
				return "Good";
			case 4:
				return "Strong";
			default:
				return "";
		}
	};

	const getColor = () => {
		switch (strength) {
			case 0:
				return "bg-red-500";
			case 1:
				return "bg-orange-500";
			case 2:
				return "bg-yellow-500";
			case 3:
				return "bg-blue-500";
			case 4:
				return "bg-green-500";
			default:
				return "bg-gray-200";
		}
	};

	// Only show if password has some content
	if (!password) return null;

	return (
		<div className="mt-1 mb-3">
			<div className="flex justify-between mb-1">
				<span className="text-xs">Password Strength:</span>
				<span className="text-xs font-medium">{getLabel()}</span>
			</div>
			<div className="w-full h-1 bg-gray-200 rounded-full">
				<div
					className={`h-1 rounded-full ${getColor()}`}
					style={{ width: `${(strength / 4) * 100}%` }}
				></div>
			</div>
		</div>
	);
};

export default PasswordStrengthIndicator;
