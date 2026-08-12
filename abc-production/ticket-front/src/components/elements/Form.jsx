import React from "react";
import { Form } from "react-bootstrap";
import { Controller } from "react-hook-form";
import Select from "react-select";

export function FormInput({
  register,
  formState: { errors, isSubmitted },
  label,
  name,
  required,
  ...rest
}) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="text-capitalize mb-1">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Form.Label>
      <Form.Control
        {...register}
        isInvalid={errors[name] && isSubmitted}
        isValid={!errors[name] && isSubmitted}
        {...rest}
      />
      {errors[name] ? (
        <Form.Control.Feedback type="invalid">
          {errors[name].message}
        </Form.Control.Feedback>
      ) : null}
    </Form.Group>
  );
}

export function FormSelect({
  register,
  formState: { errors, isSubmitted },
  label,
  name,
  required,
  children,
  ...rest
}) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="text-capitalize mb-1">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Form.Label>
      <Form.Select
        {...register}
        isInvalid={errors[name] && isSubmitted}
        isValid={!errors[name] && isSubmitted}
        {...rest}
      >
        {children}
      </Form.Select>

      {errors[name] ? (
        <Form.Control.Feedback type="invalid">
          {errors[name].message}
        </Form.Control.Feedback>
      ) : null}
    </Form.Group>
  );
}

export function FormReactSelect({
  register,
  formState: { errors, isSubmitted },
  label,
  name,
  required,
  options,
  control,
  ...rest
}) {
  const customThem = (them) => {
    return {
      ...them,
      colors: {
        ...them.colors,
        primary: "#00A3FF",
        neutral70: "#fff",
        neutral90: "#fff",
      },
    };
  };
  return (
    <Form.Group className="mb-3">
      <Form.Label className="text-capitalize mb-1">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Form.Label>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, ref, name } }) => (
          <Select
            inputRef={ref}
            theme={customThem}
            className={`basic-single ${
              errors[name] && isSubmitted && "isInvalid"
            } ${!errors[name] && isSubmitted && "isValid"}`}
            classNamePrefix="select"
            defaultValue={options[0]}
            isSearchable={false}
            placeholder={label}
            options={options}
            value={options.find((c) => c.value === value)}
            onChange={(val) => onChange(val.value)}
            {...rest}
          />
        )}
      />
      {errors[name] ? (
        <div className="text-danger" type="invalid">
          {errors[name].message}
        </div>
      ) : null}
    </Form.Group>
  );
}
