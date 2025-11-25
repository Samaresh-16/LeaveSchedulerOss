// src/hooks/useFormValidation.js
import { useState } from "react";

/**
 * A simple form validation hook
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function that returns errors object
 * @returns {Object} Form state and helpers
 */
const useFormValidation = (initialValues, validate) => {
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const fieldValue = type === "checkbox" ? checked : value;

		setValues({
			...values,
			[name]: fieldValue,
		});

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: null,
			});
		}
	};

	const handleBlur = (e) => {
		const { name } = e.target;
		setTouched({
			...touched,
			[name]: true,
		});

		// Validate the field when it loses focus
		const validationErrors = validate(values);
		if (validationErrors[name]) {
			setErrors({
				...errors,
				[name]: validationErrors[name],
			});
		}
	};

	const validateForm = () => {
		const validationErrors = validate(values);
		setErrors(validationErrors);
		return Object.keys(validationErrors).length === 0;
	};

	const resetForm = () => {
		setValues(initialValues);
		setErrors({});
		setTouched({});
	};

	return {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
		validateForm,
		resetForm,
		setValues,
	};
};

export default useFormValidation;
